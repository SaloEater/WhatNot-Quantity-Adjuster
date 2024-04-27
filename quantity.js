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
    console.log('initting tools')

    function createToolsNode() {
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
        return parentNode
    }

    let toolsNode = createToolsNode()

    function createQuantityTool(parentNode) {
        console.log('quantity tool is initting')
        async function upkeepQuantity() {
            while (true) {
                if (!isRunning) {
                    console.log('disabled')
                    break
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
        }

        // Create a new div for the quantity tool
        var quantityDiv = document.createElement('div');
        quantityDiv.style.border = '1px solid black'; // Add border
        quantityDiv.style.padding = '10px'; // Add padding for spacing
        parentNode.appendChild(quantityDiv);

        // Add text "Quantity" above the button
        var quantityText = document.createElement('div');
        quantityText.textContent = 'Quantity';
        quantityDiv.appendChild(quantityText);

        var button = document.createElement('button');
        button.innerHTML = 'Start';
        button.style.width = '100px'; // Adjust width as necessary
        button.style.height = '50px'; // Adjust height as necessary
        button.style.fontSize = '1em'; // Reset font size for button
        quantityDiv.appendChild(button);
        parentNode.appendChild(quantityDiv)

        var isRunning = false;

        // Function to start/stop action
        function toggleAction() {
            let oldIsRunning = isRunning
            isRunning = !isRunning;
            if (oldIsRunning) {
                // Stop action
                console.log('Action will be stopped after current cycle');
                button.innerHTML = 'Start';
                parentNode.style.backgroundColor = 'green'; // Reset background color
                // Add your stop action code here
            } else {
                // Start action
                console.log('Action started');
                button.innerHTML = 'Stop';
                parentNode.style.backgroundColor = 'red'; // Apply green background color
                // Add your start action code here
                upkeepQuantity()
            }
        }
        // Attach click event listener to the button
        button.addEventListener('click', toggleAction);
        console.log('quantity tool was init')
    }

    function createSleepFeedback(parentNode) {
        //Time node
        var timeNode = document.createElement('div');
        timeNode.innerHTML = 'Time left: 0'; // Initial text
        parentNode.appendChild(timeNode);// Example function to update the time left text

        function updateTimeLeft(time) {
            timeNode.innerHTML = 'Time left: ' + time;
        }

        return (delay) => {
            let totalTime = delay / 1000
            updateTimeLeft(totalTime)
            let intervalId = setInterval(() => {
                totalTime -= 0.1
                updateTimeLeft(Math.round(totalTime * 10) / 10);
            }, 100)
            let promise = (new Promise((resolve) => setTimeout(resolve, delay))).then(() => {
                clearInterval( intervalId)
                updateTimeLeft(0)
            })
            return promise
        }
    }

    function createDuplicateTool(parentNode) {
        // Create a new div for the quantity tool
        var parentDiv = document.createElement('div');
        parentDiv.style.border = '1px solid black'; // Add border
        parentDiv.style.padding = '10px'; // Add padding for spacing

        // Add text "Quantity" above the button
        var quantityText = document.createElement('div');
        quantityText.textContent = 'Duplicate';
        parentDiv.appendChild(quantityText);

        // Create a text input
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '';
        input.style.width = '50px'; // Adjust width as necessary
        parentDiv.appendChild(input);

        // Create a button
        const dButton = document.createElement('button');
        dButton.textContent = 'Duplicate';
        parentDiv.appendChild(dButton);

        var duplicateAmountNode = document.createElement('div');
        duplicateAmountNode.innerHTML = 'Items left: 0'; // Initial text
        parentDiv.appendChild(duplicateAmountNode);

        parentNode.appendChild(parentDiv);

        // Add click event listener to the button
        dButton.addEventListener('click', async () => {
            // Read the value from the input field
            let duplicateAmount = parseInt(input.value);
            if (duplicateAmount <= 0 || duplicateAmount == NaN) {
                console.log('invalid amount', input.value)
                return
            }

            dButton.disabled = true
            for (;duplicateAmount >= 1; duplicateAmount--) {
                updateDuplicateAmountLeft(duplicateAmount)
                await sleep(1000)
                let optionsButton = null
                while (!optionsButton) {
                    let buttons = Array.from(document.querySelectorAll('button'))
                    let optionsButtons = buttons.filter(i => i.innerText == 'Options')
                    if (optionsButtons.length > 0 && !optionsButtons[0].disabled) {
                        console.log('options button found', optionsButtons[0])
                        optionsButton = optionsButtons[0]
                    } else {
                        console.log('no options button found')
                        await sleep(1000)
                    }
                }
                await sleep(1000)
                optionsButton.click()
                let duplicateButton = null
                while (!duplicateButton) {
                    let buttons = Array.from(document.querySelectorAll('a'))
                    let duplicateButtons = buttons.filter(i => i.textContent.includes("Duplicate listing"))
                    if (duplicateButtons.length > 0 && !duplicateButtons[0].disabled) {
                        console.log('duplicate button found', duplicateButtons[0])
                        duplicateButton = duplicateButtons[0]
                    } else {
                        console.log('no duplicate button found')
                        await sleep(1000)
                    }
                }
                await sleep(1000)
                duplicateButton.click()
                let reviewButton = null
                while (!reviewButton) {
                    let buttons = Array.from(document.querySelectorAll('button'))
                    let reviewButtons = buttons.filter(i => i.innerText == 'Review Listing')
                    if (reviewButtons.length > 0 && !reviewButtons[0].disabled) {
                        console.log('review button found', reviewButtons[0])
                        reviewButton = reviewButtons[0]
                    } else {
                        console.log('no review button found')
                        await sleep(1000)
                    }
                }
                await sleep(1000)
                reviewButton.click()
                let listButton = null
                while (!listButton) {
                    let buttons = Array.from(document.querySelectorAll('button'))
                    let listButtons = buttons.filter(i => i.innerText == 'List Now')
                    if (listButtons.length > 0 && !listButtons[0].disabled) {
                        console.log('list button found', listButtons[0])
                        listButton = listButtons[0]
                    } else {
                        console.log('no list button found')
                        await sleep(1000)
                    }
                }
                await sleep(1000)
                listButton.click()
            }
            updateDuplicateAmountLeft(0)
            dButton.disabled = false
        });

        // Example function to update the time left text
        function updateDuplicateAmountLeft(amount) {
            duplicateAmountNode.innerHTML = 'Items left: ' + amount;
        }
    }

    let sleep = createSleepFeedback(toolsNode)
    createQuantityTool(toolsNode)
    createDuplicateTool(toolsNode)

    console.log('tools were init')
})();