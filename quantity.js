// ==UserScript==
// @name         WhatNot Quantity
// @namespace    http://tampermonkey.net/
// @version      2024-04-19
// @description  This is a new description.
// @author       You
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @license MIT
// @match        https://www.whatnot.com/dashboard/listings*
// ==/UserScript==

(async function() {
    'use strict';
    console.log('start')

    var parentNode = document.createElement('div');
    parentNode.style.position = 'fixed';
    parentNode.style.top = '50%';
    parentNode.style.right = '0';
    parentNode.style.transform = 'translateY(-50%)';
    parentNode.style.backgroundColor = 'green';
    parentNode.style.padding = '10px';
    parentNode.style.fontSize = '2em'; // 2 times bigger font size
    parentNode.style.zIndex = '9999'; // Set a high z-index
    document.body.appendChild(parentNode);

    // Create a button
    var button = document.createElement('button');
    button.innerHTML = 'Start';
    button.style.width = '100px'; // Adjust width as necessary
    button.style.height = '50px'; // Adjust height as necessary
    button.style.fontSize = '1em'; // Reset font size for button
    parentNode.appendChild(button);

    var text = document.createElement('button');
    button.innerHTML = 'Start';
    button.style.width = '100px'; // Adjust width as necessary
    button.style.height = '50px'; // Adjust height as necessary
    button.style.fontSize = '1em'; // Reset font size for button
    parentNode.appendChild(button);

    var timeNode = document.createElement('div');
    timeNode.innerHTML = 'Time left: 0'; // Initial text
    parentNode.appendChild(timeNode);

    // Example function to update the time left text
    function updateTimeLeft(time) {
        timeNode.innerHTML = 'Time left: ' + time;
    }

    var isRunning = false;

    // Function to start/stop action
    function toggleAction() {
        if (isRunning) {
            // Stop action
            console.log('Action stopped');
            button.innerHTML = 'Start';
            parentNode.style.backgroundColor = 'green'; // Reset background color
            // Add your stop action code here
        } else {
            // Start action
            console.log('Action started');
            button.innerHTML = 'Stop';
            parentNode.style.backgroundColor = 'red'; // Apply green background color
            // Add your start action code here
        }
        isRunning = !isRunning;
    }
    // Attach click event listener to the button
    button.addEventListener('click', toggleAction);

    console.log('init logic')
    const sleep = (delay) => {
        let totalTime = delay / 1000
        updateTimeLeft(totalTime)
        let intervalId = setInterval(() => {
            totalTime -= 1
            updateTimeLeft(totalTime)
        }, 1000)
        let promise = (new Promise((resolve) => setTimeout(resolve, delay))).then(() => {
          clearInterval( intervalId)

            updateTimeLeft(0)
        })
        return promise
    }
//    document.addEventListener('load', async () => {
            console.log('load')
    while (true) {
        if (!isRunning) {
            console.log('disabled')
await            sleep(5000)
            continue
        }
        let tbody = document.querySelectorAll('tbody')[0]
        console.log('iterating', tbody, tbody.childNodes)
        for (let tr of Array.from(tbody.childNodes).reverse()) {
            let availabilityTd = tr.childNodes[4]
            let parent = availabilityTd.childNodes[0]
            let div = parent.childNodes[0]

            if (div.innerText != '0' ) {
                //console.log('no', div)
                continue
            }

            div.click()
            setTimeout(() => {
                let quantity = document.querySelector('[name="quantity"]')
                console.log(quantity)
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value').set;
                console.log('set from', quantity.value, 1)
                nativeInputValueSetter.call(quantity, 1);
                const event = new Event('input', { bubbles: true });
                quantity.dispatchEvent(event);
                setTimeout(() => {
                    let commonParent = quantity.parentNode.parentNode.parentNode.parentNode
                    let buttons = commonParent.childNodes[1]
                    let updateButton = buttons.childNodes[1]
                    console.log('click', quantity.value)
                    updateButton.click()
                }, 1000)
            }, 1000)
            console.log('sleeping iteration')
            await sleep(5000)
        }

        console.log('sleeping while')
        await sleep(1000)
        console.log('going to inactive')
        document.querySelector('[value="Inactive"]').click()
        await sleep(10000)
        console.log('going to active')
        document.querySelector('[value="Active"]').click()
        await sleep(60000)
    }
    //})
})();