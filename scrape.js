/**
 * SCRAPER FOR WIKIPEDIA IATA CODES FOR AIRLINES AND AIRPORTS
 */


const fetch = require('node-fetch');
const jsdom = require("jsdom");
const fs = require('fs');
const { JSDOM } = jsdom;

const airlineCodes = 'List_of_airline_codes'
const airportCodes = 'List_of_airports_by_IATA_code:_'

/**
 * FETCH HTML FROM WIKIPEDIA RETURN DOM
 * type -> airlineCodes or airportCodes
 * arg -> letter for airportCodes
 */
const getDom = async (type, arg = '') => {
    const response = await fetch(`https://en.wikipedia.org/wiki/${type}${arg}`)
    const text = await response.text()
    const dom = await new JSDOM(text)
    return dom
}

/**
 * PARSE DOM FOR AIRLINES AND RETURN JSON
 */
const parseDomAirline = async () => {
    const output = {}
    const dom = await getDom(airlineCodes)

    const IATA = dom.window.document.querySelectorAll('tr td:first-child');
    const airline = dom.window.document.querySelectorAll('tr td:nth-child(3)');

    for (let i = 0; i < IATA.length; i++) {
        const code = IATA[i].textContent.replace('\n', '')
        const name = airline[i].textContent.replace('\n', '')
        if (code.length > 1) {
            output[code] = { name }
        }
    }
    return output
}

/**
 * PARSE DOM FOR AIRPORTS AND RETURN JSON
 */
const parseDomAirport = async (letter) => {
    const output = {}
    const dom = await getDom(airportCodes, letter)

    const IATA = dom.window.document.querySelectorAll('tr td:first-child');
    const airport = dom.window.document.querySelectorAll('tr td:nth-child(3)');
    const location = dom.window.document.querySelectorAll('tr td:nth-child(4)');

    for (let i = 0; i < IATA.length; i++) {
        const code = IATA[i].textContent.replace('\n', '')
        const name = airport[i].textContent.replace('\n', '')
        const place = location[i].textContent.replace('\n', '')
        if (code.length > 1) {
            output[code] = { name, place }
        }
    }
    return output
}

/**
 * IMPLEMENT parseDom AND WRITE JSON TO FILE
 */
const scrapeAndWrite = async (type) => {
    if (type === airlineCodes) {
        //Get raw dom
        const raw = await parseDomAirline()
        //Parse to JSON
        const data = JSON.stringify(raw)
        //Write to file
        fs.writeFile(`results/airlineIATAs.json`, data, function (error) {
            console.log(error)
        })
    } else if (type === airportCodes) {
        //Cycle through alphabet to avoid monstrous JSON
        for (let i = 65; i < 91; i++) {
            //Get letter for getDom arg
            const letter = String.fromCharCode(i)
            //Get raw dom
            const raw = await parseDomAirport(letter)
            //Parse to JSON
            const data = JSON.stringify(raw)
            //Write to file
            fs.writeFile(`results/airportIATAs/${letter}.json`, data, function (error) {
                console.log(error)
            })
        }
    }
}
// scrapeAndWrite(airlineCodes)
scrapeAndWrite(airportCodes)