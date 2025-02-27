const body = document.querySelector('body');
const main = document.querySelector('main');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Wait for keyboard press before continuing
function keyboardPress() {
    return new Promise(resolve => {
        const handleKeyDown = e => {
            if (['Enter', 'Space', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
                main.classList.remove('next-arrow');
                document.removeEventListener('keydown', keyboardPress);
                resolve();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

function showText(text, options = {}) {
    const append = options.append ?? false;
    if ((options.clearScreen ?? true) && !append) main.textContent = '';
    let p;
    if (!append) {
        // style p tag
        p = document.createElement('p');
        p.innerHTML = text;
        p.style.color = options.color ?? 'white';
        if (options.styles) {
            for (const [key, value] of Object.entries(options.styles)) {
                p.style[key] = value;
            }
        }
        if (options.shake ?? false) p.classList.add('shake');
        main.appendChild(p);
    } else { // use styles of p tag you are appending to
        p = main.querySelector('p:last-child');
    }
    return p;
}

// reveal character by character the text
function typeText(text, options = {}) {
    // start with empty p
    const p = showText('', options);
    let i = 0;
    return new Promise(resolve => {
        // every options.speed millisecond, print a character to the screen
        const interval = setInterval(async () => {
            if (text[i] != '~') p.innerHTML += text[i]; // '~' indicates a pause in the text
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (options.waitForKeyboard ?? true) {
                    // add next arrow after 100ms and move on when keyboard is pressed
                    const addArrow = setTimeout(() => main.classList.add('next-arrow'), 100);
                    await keyboardPress();
                    clearTimeout(addArrow); // cancel adding arrow if keyboard press happens before the 100ms
                }
                resolve();
            } else if (text[i - 1] == '~' || ((options.punctuationPause ?? true) && ['.', '!', '?', ',', ';', '\n'].includes(text[i - 1]))) {
                clearInterval(interval);
                await wait(options.pauseLength ?? 500); // pause between sentences or phrases
                await typeText(text.slice(i), { ...options, append: true });
                resolve();
            }
        }, options.speed ?? 25);
    });
}

// text color of each character
const characterColors = {
    'You': 'white',
    'Rob': '#01f330', // green
    'Amelia': 'pink',
    'James': '#3cacff', // blue
    'Victoria': '#f77f42', // orange
    '???': '#f00303'
}

async function typeDialog(character, text, options) {
    if (character == '???') {
        // unwanted effect where the '???' appears slowly 
        await typeText(character + ': ', { color: characterColors[character], ...options, punctuationPause: false, waitForKeyboard: false });
        await typeText(text, { color: characterColors[character], ...options, append: true });
    } else await typeText(`${character}: ${text}`, { color: characterColors[character], ...options });
}

// Show dramatic title
const title = document.getElementById('title');
const bg = document.getElementById('bg');
async function showTitle(text) {
    main.textContent = '';
    title.style.opacity = 0;
    bg.style.opacity = 0;
    await wait(1000);
    title.innerHTML = text;
    title.style.opacity = 1;
    bg.style.opacity = 1;
    await wait(3000);
    title.style.opacity = 0;
    bg.style.opacity = 0;
    await wait(3000);
}

// List 2 or more choices the player can choose from
function displayChoices(question, choices) {
    const label = document.createElement('label'); // question
    label.innerHTML = question;
    main.appendChild(label);
    const nav = document.createElement('nav');

    // wait until one of the choices is selected
    return new Promise(resolve => {
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.addEventListener('mouseup', () => {
                main.textContent = '';
                resolve(choice);
            });
            // add each element to the container element (nav)
            nav.appendChild(button);
        });
        // add to main
        main.appendChild(nav);
    });
}

// background image changer
const img = document.querySelector('img');
function changeImage(src) {
    img.src = 'images/' + src;
}

let choices = {};

// Story
(async () => {
    // using double quotes ("") because a lot of single quotes (') are used

    changeImage("revolver.jpg")
    await showTitle("1 minute before the shot");
    await ending("?");


    await showTitle("10 hours before the shot");
    changeImage("abandoned-city.jpg")

    await typeDialog("Rob", "Aright, I need a 2 people to look for some medical supplies~ and another 2 people to work on the water system for the sweet potatoes. Everyone got that?");
    await typeDialog("James", "I got the water system");
    await typeDialog("Rob", "ok", { clearScreen: false });
    await typeDialog("Amelia", "Then I'll go hunting for the medical supplies");
    await typeDialog("You", "Um..~ I'll go with ", { punctuationPause: false, waitForKeyboard: false });
    choices.partner = await displayChoices("Choose who you want to go with.", ["James", "Amelia"]);
    await typeDialog("You", `I'll go with ${choices.partner}.`);
    if (choices.partner == "James") {
        await typeDialog("Victoria", "That means I'm with Amelia, Woohoo!");
        await typeDialog("Amelia", "Ok, let's take the truck and go about 15 minutes south.~ We can look for...", { punctuationPause: false });
        await wait(500);
        await typeDialog("James", "Let's scavenge for some pipes and other scrap for the water system.");
        await typeDialog("You", "Okay.");
        await showText("Three hours later");
        changeImage("scrap.jpg")
        await wait(2000);
        await typeDialog("You", "Alright, this should be enough.");
        await typeDialog("James", "I guess that means more sorting car parts for me.");
        await typeDialog("You", "Yeah, doesn't sound fun.");
        await typeDialog("James", "Yeah... ", { clearScreen: false });
        await typeText("*Silence*");
        await typeDialog("You", "Um~");
        await typeDialog("You", "Look, I know this kind of a weird thing to bring about now, but I~ um~ I guess I'll go into it.");
        await typeDialog("You", "I'm sorry about Jessica, I know you two were close friends.");
        await typeDialog("James", "Look, can we not get into this?");
        await typeDialog("You", "I know, I know.~~ But I really need to say this.", { punctuationPause: false});
        await typeDialog("James", "Okay, I get it! I know you didn't mean to. Anyone would have made that same mistake.");
        choices.conversationWithJames = await displayChoices("How do you respond?", ["Agree with James", "Take the blame"])
        if (choices.conversationWithJames == "Agree with James") await typeDialog("You", "No, I mean technically, yes, but If I was at different angle... ");
        else await typeDialog("You", "But it was me!");
        await typeText("When took the shot,~ and it hit her in the leg, she shouldn't have died. She just kept bleeding.");
        await typeDialog("James", "Yea");
        await typeText("*More silence*");
    } else { // choices.partner == "Amelia"
        await typeDialog("Victoria", "Awesome! I was thinking about running pipes UP hill instead and using a pump,~ that means we could keep the water at ground level...", { punctuationPause: false });
        await typeDialog("Amelia", "Um, ok~ We'll head down south for about 15 minutes with the truck and look for some empty hospitals, make sure they're not already looted, and find medical supplies~ Oh, we can also get other random stuff too on our way.", { speed: 35 });
        await typeDialog("You", "Great");
        await wait(400);
        await typeDialog("Amelia", "Oh, it looks like the truck might need a new backup wheel, this one looks deflated.");
        await typeDialog("You", "Someone else can look at the after. We'll probably be fine.");
        // TODO?: choice when they are getting other random stuff
        await showText("At an abandoned hospital");
        changeImage("hospital.jpg")
        await wait(2000);
        await typeDialog("You", "Amelia, I think this is enough. You want to go back now?");
        await typeDialog("Amelia", "Um yeah, okay I'll get these water bottles and you can get that defibrillator and walkie-talkie");
        await typeDialog("You", "Oh, there's also some painkillers.~ They're expired though.");
        await typeDialog("You", "Um, the walkie-talkie looks broken, the defibrillator looks fine though. Can you take one of them? My hands are full right now.");
        await typeDialog("Amelia", "Can't mine are full too.");
        let possibleItems = ["walkie-talkie", "defibrillator", "painkillers"];
        choices.items = [];
        choices.items.push(await displayChoices("Choose two to bring back to camp.", possibleItems));
        possibleItems = possibleItems.filter(item => item != choices.items[0]);
        choices.items.push(await displayChoices("Choose two to bring back to camp.", possibleItems));
        await typeDialog("You", `Ok, I'll just get the ${choices.items[0]} and ${choices.items[1]}.`);

        // await typeDialog("Amelia", "You know, this place reminds me of Jessica.");
        // await typeDialog("You", "Yea, I~ when ");
        // await typeDialog("", "");
    }
    main.textContent = '';
    await showText("You are back at camp.");
    await wait(2000);
    await showText("You decide to check on parts of the camp since you are bored.", { clearScreen: false });
    await keyboardPress();
    choices.checkActivity = await displayChoices("Choose which to check", ["Check the generator", "Check extra car parts"]);
    if (choices.checkActivity == "Check the generator") {
        await typeText("The generator looks fine.");
        await typeText("Oh, someone finally fixed the backup one too.");
        await typeText("They didn't clean up though.");
    } else {
        if (choices.partner == "Amelia") await typeText("Oh yea, that truck wheel. Maybe there's an extra?");
        await typeText("I can't find anything here. I don't know how this is place is organized or if it even is.");
    }
    await typeText("Whatever, I wonder where everyone else is.");
    await showText("The sun starts to set");
    await wait(2000);
    await typeDialog("James", "Alright see you guys. I got to do something.");
    await typeDialog("Amelia", "Yea, me too");
    await typeDialog("Victoria", "Ok, see you guys tomorrow.");
    await typeDialog("James", "Yeah");

    await showTitle("1 day before the shot");

    await typeDialog("You", "What a day!");
    await typeDialog("Rob", "Yea, that deer will be enough food for a couple of days.")
    await typeDialog("Victoria", "And, Joseph finally put that rifle to use.");
    await typeDialog("You", "Here's how I got it. The deer walking across a road. I was camped on the second floor of a building next to the road and shot it right through a hole in the concrete.");
    await typeDialog("Amelia", "You used that rifle Vic found like a month ago, right?");
    await typeDialog("You", "Yup");
    await typeDialog("James", "What time did you guys get back? I haven't even seen the deer yet.");
    await typeDialog("Rob", "About 3 hours after noon. Joseph only needed two shots.");
    await typeDialog("You", "So, what have you and Amelia been doing?");
    await typeDialog("James", "Just some repairs and general oganizing");
    await typeDialog("Amelia", "Oh, I was fixing the backup generator. It had a loose seal I replaced.");
    await typeDialog("James", "Um and I did organized some of the extra parts for the cars.");
    await typeDialog("Rob", "Well, I going to sleep. See you guys tomorrow.");
    
    await showText("The next day");
    await wait(2000);

    await typeDialog("James", "Alright see you guys. I got to do something.");
    await typeDialog("Amelia", "Yea, me too");
    await typeDialog("Victoria", "Ok, see you guys tomorrow.");
    await typeDialog("James", "Yeah");

    choices.follow = await displayChoices("Who do you follow?", ["Follow James", "Follow Amelia"]);
    if (choices.follow == "Follow James") {
        await typeText("You see James, alone.");
        if (choices.partner == "James") await typeDialog("James", "I can't. He killed Jessica. I have to kill him.");
        else {
            await typeDialog("James", "He found out, I have to kill him.");
            await typeDialog("You", "What, what did I even find out?");
        }
        choices.action = await displayChoices("What do you do?", ["Fight him", "Tell someone"]);
        if (choices.action == "Fight him") {
            await typeDialog("You", "James!");
            await typeText("James pulls out a rusty revolver.");
            await ending(0)
            await showTitle("You died");
        } else {
            await typeText("You run towards the nearest person you see.");
            await typeDialog("You", "Vic! I think James is gonna kill me!");
            await typeDialog("Victoria", "He wouldn't! I don't believe you!");
            await typeDialog("You", "Just get the rifle if you see him trying to kill me, shoot him.");
            await typeDialog("Victoria", "What? I, I~ ");
            await typeDialog("You", "Get the rifle!");
            await typeDialog("James", "Joseph!");

            await ending(0);
            await typeDialog("You", "Wwhat?");
            await typeDialog("Victoria", "I, I shot him.");
            await typeDialog("You", "I didn't die. Thank you Vic.");
            await typeDialog("Victoria", "I killed him!");
        }
    } else {
        await typeText("You follow Amelia towards the truck.");
        await typeText("Suddenly you see someone.");
        await typeText("Then they swing at you.");
        await typeDialog("You", "Wait no! ", { waitForKeyboard: false });
        await showText("Wack!", { styles: {"font-weight": "bold" } });


        await showTitle("1 minute before the shot");
        await typeDialog("You", "Ugghhh...", { punctuationPause: false });
        await ending(0);

        await showTitle("You died");
    }
})();

async function ending(type) {
    if (type == '?') {
        await typeDialog("You", "Wait!");
        await typeDialog("You", "No no no no no, Don't do that! Are you crazy?");
        await typeDialog("???", "Shut up! This is your fault, Everything that happened that lead to where we are right now was because of YOU.");
        await typeDialog("You", "What? That doesn't matter, you can't just kill me!");
        await typeDialog("???", "Watch me.");
        await typeDialog("You", "No wait~ ", { pauseLength: 200, waitForKeyboard: false });
        await showText("BANG", { color: 'red', shake: true, styles: {"font-weight": "bold" }, waitForKeyboard: false });
    } else if (type == 0) {
        await typeDialog("You", "Wait!");
        await typeDialog("You", "No no no no no, Don't do that! Are you crazy?");
        await typeDialog("James", "Shut up! This is your fault, Everything that happened that lead to where we are right now was because of YOU.");
        if (choices.conversationWithJames == "Take the blame") await typeDialog("James", "You said it you yourself, today!");
        else if (choices.conversationWithJames == "Agree with James") await typeDialog("James", "You shouldn't have took that shot! You killed her!");
        else await typeDialog("James", "You know what you did!");
        await typeDialog("You", "What? That doesn't matter, you can't just kill me!");
        await typeDialog("James", "Watch me.");
        await typeDialog("You", "No wait~ ", { pauseLength: 200, waitForKeyboard: false });
        await showText("BANG", { color: 'red', shake: true, styles: { "font-weight": "bold" }, waitForKeyboard: false });
    }
    await wait(1400);
}