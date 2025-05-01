import React from 'react'
import CountUp, { useCountUp } from 'react-countup';

const FunFact = [
    {
        title: '980',
        subTitle: 'Complete Projects',
        symbol: '+',
    },
    {
        title: '4.7',
        subTitle: 'Average Rating',
        symbol: '/5',
    },
    {
        title: '535',
        subTitle: 'Happy Clients',
        symbol: '+',
    },
    {
        title: '15',
        subTitle: 'Winning Awards',
        symbol: '+',
    },


]


const FunFactSection = (props) => {

    useCountUp({
        end: '56656',
        ref: 'counter',
        enableScrollSpy: true,
        scrollSpyDelay: 1000,
    });


    return (

        <section className="funfact-section" id="FunFact">
            <div className="container">
                <div className="row">
                    {FunFact.map((funfact, fitem) => (
                        <div className="col-xl-3 col-lg-6 col-md-6 col-12" key={fitem}>
                            <div className="item">
                                <h2><span><CountUp end={funfact.title} enableScrollSpy /></span>{funfact.symbol}</h2>
                                <h4>{funfact.subTitle}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <span id="counter" className='d-none' />
        </section>
    )
}

export default FunFactSection;