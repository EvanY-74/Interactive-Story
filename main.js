const body = document.querySelector('body');
const main = document.querySelector('main');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function keyBoardPress() {
    return new Promise(resolve => {
        const handleKeyDown = e => {
            if (['Enter', 'Space', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
                document.removeEventListener('keydown', keyBoardPress);
                resolve();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

function showText(text, options) {
    const append = options.append ?? false;
    if ((options.clearScreen ?? true) && !append) main.textContent = '';
    let p;
    if (!append) {
        p = document.createElement('p');
        p.innerHTML = '';
        p.style.color = options.color ?? 'white';
        if (options.styles) {
            for (const [key, value] of Object.entries(options.styles)) {
                p.style[key] = value;
            }
        }
        if (options.shake ?? false) p.classList.add('shake');
        main.appendChild(p);
    } else {
        p = main.querySelector('p:last-child');
    }
    return p;
}

function typeText(text, options = {}) {
    const p = showText(text, options);
    let i = 0;
    return new Promise(resolve => {
        // every options.speed millisecond, print a character to the screen
        const interval = setInterval(async () => {
            if (text[i] != '~') p.innerHTML += text[i]; // '~' indicates a pause in the text
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (!(options.noKeyBoardPress ?? false)) await keyBoardPress();
                resolve();
            } else if (text[i - 1] == '~' || (!options.noPause && ['.', '!', '?', ',', ';', '\n'].includes(text[i - 1]))) {
                clearInterval(interval);
                await wait(options.pauseLength ?? 700); // pause between sentences or phrases
                await typeText(text.slice(i), { options, append: true });
                resolve();
            }
        }, options.speed ?? 30);
    });
}

const characterColors = {
    'You': 'white',
    'Rob': '#01f330', // green
    'Sarah': 'pink',
    'James': 'blue',
    'Victoria': '#f77f42', // orange
    // 'Don': 'red',
    // 'Ella': 'green',
    // 'Marcus': 'yellow',
}

async function typeDialog(character, text, options) {
    await typeText(`${character}: ${text}`, { color: characterColors[character], ...options });
}

const title = document.getElementById('title');
async function showTitle(text) {
    main.textContent = '';
    body.style.backgroundColor = 'black';
    title.style.opacity = 0;
    await wait(1000);
    title.innerHTML = text;
    title.style.opacity = 1;
    await wait(3000);
    title.style.opacity = 0;
    await wait(3000);
}

function displayChoices(question, choices) {
    const p = document.createElement('p');
    p.innerHTML = question;
    main.appendChild(p);
    const nav = document.createElement('nav');

    return new Promise(resolve => {
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.addEventListener('mouseup', () => {
                main.textContent = '';
                resolve(choice);
            });
            nav.appendChild(button);
        });
        main.appendChild(nav);
    });
}


let choices = {};

(async () => {
    // await showTitle("1 minute before the shot");
    // await typeText("Wait!");
    // await typeText("No no no no no, Don't do that! Are you crazy?");
    // await typeText("Shut up! This is your fault, Everything that happened that lead to where we are right now was because of YOU.", { color: "red" });
    // await typeText("What? That doesn't matter, you can't just kill me!");
    // await typeText("Watch me.", { color: "red" });
    // await typeText("No wait    ", { noKeyBoardPress: true });
    // await showText("BANG", { color: "red", shake: true, styles: {"font-weight": "bold" }, noKeyBoardPress: true });
    // await wait(1400);

    // await showTitle("1 day before the shot");

    // await typeDialog("Rob", "Aright, I need a 2 people to look for some medical supplies~ and another 2 people to work on the water system for the sweet potatoes. Everyone got that?");
    // await typeDialog("James", "I got the water system");
    // await typeDialog("Rob", "ok", { clearScreen: false });
    // await typeDialog("Sarah", "Then I'll go hunting for the medical supplies");
    await typeDialog("You", "Um..~ I'll go with ", { noPause: true });
    choices.partner = await displayChoices("Choose who you want to go with.", ["James", "Sarah"]);
    await typeDialog("You", `I'll go with ${choices.partner}.`);
    if (choices.partner == "James") {
        await typeDialog("Victoria", "That means I'm with Sarah, Woohoo!");
        await typeDialog("Sarah", "Ok, let's take the Jeep and go about 15 minutes south.~ We can look for...", { noPause: true });
        await typeDialog("", "");
    } else { // choices.partner == "Sarah"
        await typeDialog("Victoria", "Awesome! I was thinking about running pipes UP hill instead and using a pump,~ that means we could keep the water at ground level...", { noPause: true });
        await typeDialog("Sarah", "Um, ok~ We'll head down south for about 15 minutes with the Jeep and look for some empty hospitals, make sure they're not already looted, and find medical supplies~ Oh, we can also get other random stuff too on our way.", { speed: 50 });
        await typeDialog("You", "Great");
        await typeDialog("", "");
    }
    await typeDialog("", "");
    await typeDialog("", "");
    await typeDialog("", "");
    await typeDialog("", "");

})();