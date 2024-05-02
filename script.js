let deckId;
    let playerHandValue = 0;
    let dealerHandValue = 0;
    let playerStand = false;
    let dealerStand = false;

    async function getNewDeck() {
      const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const data = await response.json();
      return data.deck_id;
    }

    async function drawCard(deckId, count = 1) {
      const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
      const data = await response.json();
      return data.cards;
    }

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

    async function playBlackjack() {
      deckId = await getNewDeck();
      let playerHand = await drawCard(deckId, 2);
      let dealerHand = await drawCard(deckId, 2);

      displayCards(playerHand, 'player-hand');
      displayCards([dealerHand[0]], 'dealer-hand');
      playerHandValue = calculateHandValue(playerHand);
      dealerHandValue = calculateHandValue([dealerHand[0]]);

      console.log("Tu mano:");
      console.log(playerHand);
      console.log("Valor de tu mano: " + playerHandValue);

      console.log("Mano del crupier:");
      console.log(dealerHand);
      console.log("Valor de la mano del crupier: " + dealerHandValue);
    }

    function displayCards(cards, containerId) {
      const container = document.getElementById(containerId);
      for (let card of cards) {
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.code;
        container.appendChild(img);
      }
    }

    async function hit() {
      if (!playerStand) {
        const playerHandContainer = document.getElementById('player-hand');
        const message = document.getElementById('message');
        const cards = await drawCard(deckId, 1);
        displayCards(cards, 'player-hand');
        playerHandValue += calculateHandValue(cards);
        console.log("Nueva carta:");
        console.log(cards);
        console.log("Valor de tu mano: " + playerHandValue);
        if (playerHandValue > 21) {
          message.textContent = "¡Te has pasado de 21! ¡Perdiste!";
          endGame();
        }
      }
    }

    async function stand() {
      playerStand = true;
      console.log("El jugador se ha plantado.");
      await dealerTurn();
    }

    async function dealerTurn() {
      const dealerHandContainer = document.getElementById('dealer-hand');
      while (!dealerStand && dealerHandValue < 17) {
        const cards = await drawCard(deckId, 1);
        displayCards(cards, 'dealer-hand');
        dealerHandValue += calculateHandValue(cards);
        console.log("Nueva carta del crupier:");
        console.log(cards);
        console.log("Valor de la mano del crupier: " + dealerHandValue);
      }
      if (dealerHandValue >= 17) {
        dealerStand = true;
        console.log("El crupier se ha plantado.");
        endGame();
      }
    }

    async function endGame() {
      const message = document.getElementById('message');
      if (playerStand && dealerStand) {
        if (playerHandValue > 21) {
          message.textContent = "¡Has perdido! El crupier gana.";
        } else if (dealerHandValue > 21 || dealerHandValue < playerHandValue) {
          message.textContent = "¡Felicidades! ¡Has ganado!";
        } else if (dealerHandValue > playerHandValue) {
          message.textContent = "¡Has perdido! El crupier gana.";
        } else {
          message.textContent = "¡Es un empate!";
        }
      }
    }

    async function restartGame() {
      document.getElementById('player-hand').innerHTML = '';
      document.getElementById('dealer-hand').innerHTML = '';
      document.getElementById('message').textContent = '';
      document.getElementById('hit-button').disabled = false;
      playerHandValue = 0;
      dealerHandValue = 0;
      playerStand = false;
      dealerStand = false;
      await playBlackjack();
    }

    document.getElementById('hit-button').addEventListener('click', hit);
    document.getElementById('stand-button').addEventListener('click', stand);
    document.getElementById('restart-button').addEventListener('click', restartGame);

    playBlackjack();