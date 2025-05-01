const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Create OpenAI client with the correct configuration
const client = new OpenAI({
  baseURL: 'https://beta.sree.shop/v1',
  apiKey: 'ddc-beta-douco49c91-3NH1WDOHu89kph4AyIpG6cpRNbqxskS8FJ4'
});

// Helper function to generate fallback responses
function generateFallbackResponse(symptom, severity) {
  // Map common symptoms to conditions
  const symptomMap = {
    'headache': [
      {
        condition: 'Tension Headache',
        urgency: severity === 'severe' ? 'Medium' : 'Low',
        description: 'A tension headache is generally a diffuse, mild to moderate pain that\'s often described as feeling like a tight band around your head. Rest, over-the-counter pain relievers, and stress management may help.',
        specialist: 'General Practitioner'
      },
      {
        condition: 'Migraine',
        urgency: severity === 'severe' ? 'High' : 'Medium',
        description: 'Migraines are often characterized by severe, throbbing pain, usually on one side of the head. They can be accompanied by nausea, vomiting, and sensitivity to light and sound.',
        specialist: 'Neurologist'
      }
    ],
    'fever': [
      {
        condition: 'Viral Infection',
        urgency: severity === 'severe' ? 'Medium' : 'Low',
        description: 'Fevers are often caused by viral infections. Rest, fluids, and over-the-counter fever reducers may help. If fever persists over 3 days or exceeds 103°F (39.4°C), seek medical attention.',
        specialist: 'General Practitioner'
      }
    ],
    'cough': [
      {
        condition: 'Common Cold',
        urgency: 'Low',
        description: 'A common cold can cause a cough due to postnasal drip or throat irritation. Rest, fluids, and over-the-counter medications may help relieve symptoms.',
        specialist: 'General Practitioner'
      },
      {
        condition: 'Bronchitis',
        urgency: severity === 'severe' ? 'Medium' : 'Low',
        description: 'Bronchitis is inflammation of the bronchial tubes. It often follows a cold and can cause a persistent cough with mucus.',
        specialist: 'Pulmonologist'
      }
    ],
    // Add more symptoms as needed
  };
  
  // Default response if symptom not found
  const defaultConditions = [
    {
      condition: 'Unspecified Condition',
      urgency: severity === 'severe' ? 'Medium' : 'Low',
      description: 'Based on your symptoms, we recommend consulting with a healthcare professional for a proper diagnosis.',
      specialist: 'General Practitioner'
    }
  ];
  
  // Find matching conditions or use default
  const conditions = [];
  
  // Check if the symptom contains any of our known symptoms
  Object.keys(symptomMap).forEach(knownSymptom => {
    if (symptom.toLowerCase().includes(knownSymptom)) {
      conditions.push(...symptomMap[knownSymptom]);
    }
  });
  
  // If no matches found, use default
  if (conditions.length === 0) {
    conditions.push(...defaultConditions);
  }
  
  // Generate doctor suggestions based on specialists
  const doctors = conditions.map(condition => {
    const specialistMap = {
      'General Practitioner': {
        name: 'Dr. Sarah Johnson',
        location: 'Community Health Clinic'
      },
      'Neurologist': {
        name: 'Dr. Michael Chen',
        location: 'Neurology Center'
      },
      'Pulmonologist': {
        name: 'Dr. Emily Rodriguez',
        location: 'Respiratory Care Center'
      },
      // Add more specialists as needed
    };
    
    const doctorInfo = specialistMap[condition.specialist] || specialistMap['General Practitioner'];
    
    return {
      name: doctorInfo.name,
      specialty: condition.specialist,
      location: doctorInfo.location
    };
  });
  
  return { conditions, doctors };
}

// OpenAI API endpoint for symptom analysis
router.post('/analyze', async (req, res) => {
  try {
    const { symptom, severity, duration } = req.body;
    
    // Validate input
    if (!symptom) {
      return res.status(400).json({ message: 'Symptom is required' });
    }
    
    console.log('Analyzing symptoms:', { symptom, severity, duration });
    
    let parsedResponse;
    
    try {
      // Add retry logic
      let retries = 3;
      let completion;
      
      while (retries > 0) {
        try {
          // Call OpenAI API using the client with the correct model
          completion = await client.chat.completions.create({
            model: "Provider-9/gpt-4.1",
            messages: [
              { 
                role: 'system', 
                content: 'You are a medical assistant AI that provides symptom analysis.' 
              },
              { 
                role: 'user', 
                content: `Analyze the following symptoms:
        Symptom: ${symptom}
        Severity: ${severity}
        Duration: ${duration}
        
        Provide a JSON response with the following structure:
        {
          "conditions": [
            {
              "condition": "Name of condition",
              "urgency": "Low/Medium/High",
              "description": "Brief description and recommendations",
              "specialist": "Type of doctor specialist recommended for this condition"
            }
          ],
          "doctors": [
            {
              "name": "Dr. Full Name",
              "specialty": "Medical specialty that matches the recommended specialists",
              "location": "Clinic or hospital name"
            }
          ]
        }`
              }
            ],
            temperature: 0.7
          });
          
          // If we get here, the API call was successful
          break;
        } catch (apiError) {
          console.error(`API call failed (${retries} retries left):`, apiError);
          retries--;
          
          if (retries === 0) {
            // Don't rethrow, just break out of the loop
            throw apiError;
          }
          
          // Wait for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('OpenAI response received');
      
      // Extract the response content
      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      try {
        // Clean the response content by removing markdown code block formatting if present
        let cleanedContent = responseContent;
        
        // Remove markdown code block indicators if present (```json and ```)
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        // Remove any backticks at the beginning or end
        cleanedContent = cleanedContent.replace(/^`+|`+$/g, '');
        
        console.log('Cleaned content for parsing:', cleanedContent);
        
        // Try to parse the cleaned content as JSON
        parsedResponse = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        
        // Try to extract JSON from the response text
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('Error extracting JSON from response:', extractError);
            throw new Error('Failed to parse AI response');
          }
        } else {
          throw new Error('Invalid response format from AI');
        }
      }
    } catch (apiOrParseError) {
      // If API call or parsing fails, use fallback
      console.log('Using fallback response due to API or parsing error');
      parsedResponse = generateFallbackResponse(symptom, severity);
    }
    
    // Return the analyzed conditions and doctor recommendations
    res.json(parsedResponse);
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({ message: 'Error analyzing symptoms', error: error.message });
  }
});

module.exports = router;