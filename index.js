const imgOverlay = `<div class="h-11 w-11 absolute top-0 left-0 bg-black opacity-75" id="img-overlay"></div>`;
const playIcon = `<svg class="w-6 h-6 absolute top-1/4 left-1/4 text-indigo-500" id="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>`;
const playingIcon = `<svg class="w-6 h-6 absolute top-1/4 left-1/4 text-indigo-500" id="playing-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`;
const pauseIcon = `<svg class="w-6 h-6 absolute top-1/4 left-1/4 text-indigo-500" id="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;

let searchBar;
let searchButton;
let searchResultsContainer;
let table;
let selectedSong = null;
let audioPlayer;
let tableHeaders = ['', 'Titre', 'Artiste', 'Album', 'Dur.'];
let isCurrentlyPlaying = false;

function init() {
    audioPlayer = document.getElementById('audio-player');
    initializeListeners();
    initializeTable();
}

function initializeListeners() {
    searchBar = document.getElementById('search-input');
    searchButton = document.getElementById('search-btn');

    // Ajout des listeners
    searchBar.addEventListener('keyup', async (event) => {
        if (event.key === 'Enter') await search();
    });
    searchButton.addEventListener('click', search);
}

function initializeTable() {
    // Construction de la table
    searchResultsContainer = document.getElementById('search-results');
    table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';

    // Construction du header de la table
    const tableHead = document.createElement('thead');
    tableHead.className = "bg-gray-50";
    tableHead.append(document.createElement('tr'));
    for (let i = 0; i < tableHeaders.length; i++) {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';

        // Classes particulières en fonction de du header
        if (i === 1 || i === 3) th.className += ' track-name-or-album-header';
        if (i === 2) th.className += ' artist-header';
        if (i === tableHeaders.length) th.className += ' duration-header';

        tableHead.children[0].appendChild(th);
        tableHead.children[0].children[i].innerHTML = tableHeaders[i];
    }

    table.appendChild(tableHead);
    searchResultsContainer.appendChild(table)
}

async function search() {
    const searchResultContaier = document.getElementById('search-results-container');
    const loaderContainer = document.getElementById('loader-container');
    const loaderTemplate = document.querySelector('#loader-template');
    const clone = document.importNode(loaderTemplate.content, true);

    searchResultContaier.classList.remove('mt-6');
    loaderContainer.appendChild(clone);

    const requestConfig = {method: 'GET', mode: 'cors', cache: 'default'};
    const response = await (await fetch(`https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=${searchBar.value.replace(' ', '+')}`, requestConfig)).json();
    const songs = response.results.filter(result => result.kind === 'song');
    populateSearchResults(songs);

    searchResultContaier.classList.add('mt-6');
    loaderContainer.removeChild(document.getElementById('loader'));
}

function populateSearchResults(songs) {
    // Corps de la table
    const tableBody = document.createElement('tbody');
    tableBody.id = 'results-table-body';
    tableBody.className = 'bg-white divide-y divide-gray-200';

    if (songs.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = tableHeaders.length;
        emptyCell.innerHTML = 'Aucun résultat';
        emptyCell.className = 'text-sm text-gray-500 cell truncate px-6 py-4 text-center';

        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
    } else {
        for (let i = 0; i < songs.length; i++) {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-100';

            row.addEventListener('click', () => {
                const searchResultsContainer = document.getElementById('search-results-container');
                const playerContainer = document.getElementById('song-player-container');
                const playerTemplateHolder = document.getElementById('song-player');
                const playerTemplate = document.querySelector('#player');
                const clone = document.importNode(playerTemplate.content, true);

                selectedSong = songs[i];

                if (playerContainer) {
                    playerContainer.querySelector('#playing-song-img').src = selectedSong.artworkUrl100;
                    playerContainer.querySelector('#playing-song-trackname').innerHTML = selectedSong.trackName;
                    playerContainer.querySelector('#playing-song-artist').innerHTML = selectedSong.artistName;
                } else {
                    clone.querySelector('#playing-song-img').src = selectedSong.artworkUrl100;
                    clone.querySelector('#playing-song-trackname').innerHTML = selectedSong.trackName;
                    clone.querySelector('#playing-song-artist').innerHTML = selectedSong.artistName;

                    searchResultsContainer.classList.add('mb-28');
                    playerTemplateHolder.appendChild(clone);
                }

                audioPlayer.src = selectedSong.previewUrl;
                audioPlayer.play();
                isCurrentlyPlaying = true;

                const playButton = document.getElementById('play-btn');
                playButton.innerHTML = '<svg class="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
            })

            tableBody.appendChild(row);


            // Ajout des cellules
            for (let j = 0; j < tableHeaders.length; j++) {
                const td = document.createElement('td');

                // Classes communes à toutes les cellules
                td.className = ' text-sm text-gray-500 cell truncate';

                // Classes particulières en fonction de la cellule
                if (j === 0) td.className += ' pl-6 w-6 h-6';
                if (j !== 0) td.className += ' px-6 py-4';
                if (j === 1 || j === 3) td.className += ' track-name-or-album-cell';
                if (j === 2) td.className += ' artist-cell';
                if (j === tableHeaders.length) td.className += ' duration-cell';

                tableBody.children[i].appendChild(td);
            }

            // Peuplement des cellules
            // Ajout de la jaquette
            const trackImgContainer = document.createElement('div');
            const trackImgInnerContainer = document.createElement('div');
            const trackImg = document.createElement('img');

            trackImgContainer.className = 'flex items-center';

            trackImgInnerContainer.className = 'img-inner-container flex-shrink-0 h-11 w-11'
            trackImgInnerContainer.id = `img-${songs[i].trackName}-inner-container`;

            trackImg.className = 'h-11 w-11';
            trackImg.id = `img-${songs[i].trackName}`;

            trackImgInnerContainer.appendChild(trackImg);
            trackImgContainer.appendChild(trackImgInnerContainer);

            tableBody.children[i].children[0].appendChild(trackImgContainer);

            // Ajout du titre
            tableBody.children[i].children[0].children[0].children[0].children[0].src = songs[i].artworkUrl100;

            // Ajout du nom de la piste, l'artiste, de l'album et de la durée
            tableBody.children[i].children[1].innerHTML = songs[i].trackName;
            tableBody.children[i].children[2].innerHTML = songs[i].artistName;
            tableBody.children[i].children[3].innerHTML = songs[i].collectionName;
            tableBody.children[i].children[4].innerHTML = millisToMinutesAndSeconds(songs[i].trackTimeMillis);
        }
    }
    clearOldTable();
    table.appendChild(tableBody)
}

function switchPlayingState() {
    if (isCurrentlyPlaying) {
        audioPlayer.pause();
        const playButton = document.getElementById('play-btn');
        playButton.innerHTML = '<svg class="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>';
    } else {
        const playButton = document.getElementById('play-btn');
        playButton.innerHTML = '<svg class="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
        audioPlayer.play();
    }

    isCurrentlyPlaying = !isCurrentlyPlaying;
}

function millisToMinutesAndSeconds(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function clearOldTable() {
    const oldTableBody = document.getElementById('results-table-body');
    if (oldTableBody) {
        table.removeChild(oldTableBody);
    }
}
