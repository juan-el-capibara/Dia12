let deckId; // Variable para almacenar el ID de la baraja
let playerHandValue = 0; // Variable para almacenar el valor total de las cartas en la mano del jugador

// Función asincrónica para obtener un nuevo mazo del API
async function getNewDeck() {
const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
const data = await response.json();
return data.deck_id;
}

// Función asincrónica para extraer cartas del mazo
async function drawCard(deckId, count = 1) {
const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
const data = await response.json();
return data.cards;
}
// Función para calcular el valor total de una mano de cartas
function calculateHandValue(hand) {
    let sum = 0;
    let aceCount = 0;
    for (let card of hand) {
        let value = parseInt(card.value);
        if (isNaN(value)) {
        if (card.value === "ACE") {
            aceCount++;
            value = 11;
        } else {
            value = 10;
        }
    }
        sum += value;
        }
    while (aceCount > 0 && sum > 21) {
            sum -= 10;
            aceCount--;
    }
    return sum;
}

// Función principal para iniciar el juego de Blackjack
async function playBlackjack() {
    deckId = await getNewDeck(); // Obtener un nuevo mazo y almacenar su ID
    let playerHand = await drawCard(deckId, 2); // Extraer dos cartas para la mano del jugador
    let dealerHand = await drawCard(deckId, 2); // Extraer dos cartas para la mano del crupier

    displayCards(playerHand, 'player-hand'); // Mostrar las cartas del jugador en el contenedor 'player-hand'
    displayCards([dealerHand[0]], 'dealer-hand'); // Mostrar solo la primera carta del crupier
    playerHandValue = calculateHandValue(playerHand); // Calcular el valor total de la mano del jugador

    console.log("Tu mano:");
    console.log(playerHand);
    console.log("Valor de tu mano: " + playerHandValue);
    console.log("Mano del crupier:");
    console.log(dealerHand[0]);
    console.log("Valor de la mano del crupier: " + calculateHandValue([dealerHand[0]]));
}

// Función para mostrar las cartas en un contenedor específico
function displayCards(cards, containerId) {
const container = document.getElementById(containerId);
    for (let card of cards) {
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.code;
        container.appendChild(img);
    }
}

// Función para pedir una carta adicional para la mano del jugador
async function hit() {
    const playerHandContainer = document.getElementById('player-hand');
    const message = document.getElementById('message');
    const cards = await drawCard(deckId, 1); // Extraer una carta adicional para el jugador
    displayCards(cards, 'player-hand'); // Mostrar la carta adicional en la mano del jugador
    playerHandValue += calculateHandValue(cards); // Actualizar el valor total de la mano del jugador
    console.log("Nueva carta:");
    console.log(cards);
    console.log("Valor de tu mano: " + playerHandValue);
    if (playerHandValue > 21) { // Si el valor total de la mano del jugador es mayor que 21
        message.textContent = "¡Te has pasado de 21! ¡Perdiste!"; // Mostrar un mensaje de pérdida
        document.getElementById('hit-button').disabled = true; // Deshabilitar el botón de pedir carta
    }
}

// Escuchar el evento de clic en el botón de pedir carta y llamar a la función 'hit'
 document.getElementById('hit-button').addEventListener('click', hit);

// Iniciar el juego de Blackjack
playBlackjack();