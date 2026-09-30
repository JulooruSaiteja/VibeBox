/* =========================
   ELEMENTS
========================= */

const audioPlayer = document.getElementById("audio-player");

const playButtons = document.querySelectorAll(".play-btn");

const progressBar = document.getElementById("progress-bar");

const currentTimeEl = document.getElementById("current-time");

const totalTimeEl = document.getElementById("total-time");

const masterPlay = document.getElementById("masterPlay");

const nextBtn = document.getElementById("next");

const prevBtn = document.getElementById("prev");


/* =========================
   SONG LIST
========================= */

const songs = [
    "assets/Song1.mp3",
    "assets/Song2.mp3",
    "assets/Song3.mp3",
    "assets/Song4.mp3",
    "assets/Song5.mp3",
    "assets/Song6.mp3",
    "assets/Song7.mp3",
    "assets/Song8.mp3"
];

let songIndex = 0;


/* =========================
   LOAD SONG
========================= */

function loadSong(index) {

    audioPlayer.src = songs[index];

}


/* =========================
   GET SONG NAME
========================= */

function getSongName(index) {

    if (index < 0 || index >= playButtons.length) {
        return "";
    }

    const card =
        playButtons[index].closest(".card");

    if (!card) {
        return "";
    }

    const title =
        card.querySelector(".card-title");

    if (!title) {
        return "";
    }

    return title.textContent.trim();
}


/* =========================
   FAVORITES
========================= */

let storedFavorites = [];

try {

    storedFavorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];

} catch (error) {

    storedFavorites = [];

}

const favorites =
    new Set(storedFavorites);


/* =========================
   RECENTLY PLAYED
========================= */

let recentlyPlayed = [];

try {

    recentlyPlayed =
        JSON.parse(
            localStorage.getItem("recentlyPlayed")
        ) || [];

} catch (error) {

    recentlyPlayed = [];

}


/* =========================
   DISPLAY FAVORITES
========================= */

function updateFavoritesList() {

    const favContainer =
        document.getElementById("fav-songs-list");

    if (!favContainer) {
        return;
    }

    favContainer.innerHTML = "";

    favorites.forEach(songName => {

        const songElement =
            document.createElement("div");

        songElement.className =
            "sidebar-song";

        songElement.textContent =
            songName;

        favContainer.appendChild(songElement);

    });

}


/* =========================
   DISPLAY RECENTLY PLAYED
========================= */

function updateRecentlyPlayedList() {

    const recentContainer =
        document.getElementById("recent-songs-list");

    if (!recentContainer) {
        return;
    }

    recentContainer.innerHTML = "";

    recentlyPlayed
        .slice(0, 3)
        .forEach(songName => {

            const songElement =
                document.createElement("div");

            songElement.className =
                "sidebar-song";

            songElement.textContent =
                songName;

            recentContainer.appendChild(
                songElement
            );

        });

}


/* =========================
   ADD TO RECENTLY PLAYED
========================= */

function addToRecentlyPlayed(index) {

    const songName =
        getSongName(index);

    if (!songName) {
        return;
    }

    recentlyPlayed =
        recentlyPlayed.filter(
            song => song !== songName
        );
     recentlyPlayed.unshift(songName);

    recentlyPlayed = recentlyPlayed.slice(0, 3);
    
    localStorage.setItem(
        "recentlyPlayed",
        JSON.stringify(recentlyPlayed)
    );

    updateRecentlyPlayedList();

}


/* =========================
   UPDATE CARD ICONS
========================= */

function updateCardIcons(activeIndex) {

    playButtons.forEach((btn, index) => {

        btn.classList.remove(
            "fa-circle-pause"
        );

        btn.classList.add(
            "fa-circle-play"
        );


        if (
            index === activeIndex &&
            !audioPlayer.paused
        ) {

            btn.classList.remove(
                "fa-circle-play"
            );

            btn.classList.add(
                "fa-circle-pause"
            );

        }

    });

}


/* =========================
   PLAY SONG FROM CARDS
========================= */

playButtons.forEach((btn, index) => {

    btn.addEventListener("click", () => {


        if (
            songIndex === index &&
            !audioPlayer.paused
        ) {

            audioPlayer.pause();

        }

        else {

            songIndex = index;


            if (isShuffle) {

                generateShuffleQueue(
                    songIndex
                );

            }


            loadSong(songIndex);


            addToRecentlyPlayed(
                songIndex
            );


            audioPlayer.play();

        }


        updateCardIcons(songIndex);

    });

});


/* =========================
   MASTER PLAY
========================= */

masterPlay.addEventListener(
    "click",
    () => {

        if (!audioPlayer.src) {

            loadSong(songIndex);

            addToRecentlyPlayed(
                songIndex
            );

        }


        if (audioPlayer.paused) {

            audioPlayer.play();

        }

        else {

            audioPlayer.pause();

        }

    }
);


/* =========================
   NEXT SONG
========================= */

nextBtn.addEventListener(
    "click",
    () => {

        playNextSong();

    }
);


/* =========================
   PREVIOUS SONG
========================= */

prevBtn.addEventListener(
    "click",
    () => {

        playPrevSong();

    }
);


/* =========================
   PLAY EVENT
========================= */

audioPlayer.addEventListener(
    "play",
    () => {

        masterPlay.classList.remove(
            "fa-circle-play"
        );

        masterPlay.classList.add(
            "fa-circle-pause"
        );


        updateCardIcons(
            songIndex
        );


        updatePlayerAlbumInfo(
            songIndex
        );

    }
);


/* =========================
   PAUSE EVENT
========================= */

audioPlayer.addEventListener(
    "pause",
    () => {

        masterPlay.classList.remove(
            "fa-circle-pause"
        );

        masterPlay.classList.add(
            "fa-circle-play"
        );


        updateCardIcons(-1);

    }
);


/* =========================
   LOAD DURATION
========================= */

audioPlayer.addEventListener(
    "loadedmetadata",
    () => {

        totalTimeEl.textContent =
            formatTime(
                audioPlayer.duration
            );

    }
);


/* =========================
   UPDATE TIME
   + PROGRESS BAR
========================= */

audioPlayer.addEventListener(
    "timeupdate",
    () => {

        const currentTime =
            audioPlayer.currentTime;

        const duration =
            audioPlayer.duration;


        currentTimeEl.textContent =
            formatTime(currentTime);


        if (duration) {

            progressBar.value =
                (currentTime / duration) * 100;

        }

    }
);


/* =========================
   SEEK SONG
========================= */

progressBar.addEventListener(
    "input",
    () => {

        audioPlayer.currentTime =
            (progressBar.value / 100)
            * audioPlayer.duration;

    }
);


/* =========================
   AUTO NEXT SONG
========================= */

audioPlayer.addEventListener(
    "ended",
    () => {

        handleSongEnd();

    }
);


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    if (isNaN(seconds)) {

        return "0:00";

    }


    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);


    return `${mins}:${
        secs < 10 ? "0" : ""
    }${secs}`;

}


/* =========================
   NEW VARIABLES & STATE
========================= */

const shuffleBtn =
    document.getElementById("shuffle");

const repeatBtn =
    document.getElementById("repeat");

const repeatIndicator =
    document.getElementById(
        "repeat-one-indicator"
    );

const volumeIcon =
    document.getElementById(
        "volume-icon"
    );

const volumeBar =
    document.getElementById(
        "volume-bar"
    );

const searchInput =
    document.getElementById(
        "search-input"
    );

const albumEl =
    document.querySelector(".album");


let isShuffle = false;

let shuffleQueue = [];

let shuffleIndex = 0;

let repeatMode = "all";

let previousVolume = 1.0;


/* =========================
   SHUFFLE UTILITIES
========================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

    return array;

}


function generateShuffleQueue(
    startIndex
) {

    let indices =
        Array.from(
            {
                length: songs.length
            },
            (_, i) => i
        );


    indices =
        indices.filter(
            i => i !== startIndex
        );


    shuffleArray(indices);


    shuffleQueue =
        [
            startIndex,
            ...indices
        ];


    shuffleIndex = 0;

}


/* =========================
   PLAY NAVIGATION
========================= */

function playNextSong() {

    if (songs.length === 0) {
        return;
    }


    if (isShuffle) {

        shuffleIndex++;


        if (
            shuffleIndex >=
            shuffleQueue.length
        ) {

            if (repeatMode === "all") {

                const lastSong =
                    songIndex;


                generateShuffleQueue(
                    lastSong
                );


                if (
                    shuffleQueue[0] ===
                        lastSong &&
                    shuffleQueue.length > 1
                ) {

                    [
                        shuffleQueue[0],
                        shuffleQueue[1]
                    ] =
                    [
                        shuffleQueue[1],
                        shuffleQueue[0]
                    ];

                }


                shuffleIndex = 0;


                songIndex =
                    shuffleQueue[
                        shuffleIndex
                    ];

            }

            else if (
                repeatMode === "off"
            ) {

                audioPlayer.pause();

                audioPlayer.currentTime =
                    0;

                updateCardIcons(-1);

                shuffleIndex = 0;

                songIndex =
                    shuffleQueue[0];

                loadSong(songIndex);

                return;

            }

            else {

                shuffleIndex = 0;

                songIndex =
                    shuffleQueue[
                        shuffleIndex
                    ];

            }

        }

        else {

            songIndex =
                shuffleQueue[
                    shuffleIndex
                ];

        }

    }

    else {

        songIndex++;


        if (
            songIndex >= songs.length
        ) {

            if (
                repeatMode === "all"
            ) {

                songIndex = 0;

            }

            else if (
                repeatMode === "off"
            ) {

                audioPlayer.pause();

                audioPlayer.currentTime =
                    0;

                updateCardIcons(-1);

                songIndex = 0;

                loadSong(songIndex);

                return;

            }

            else {

                songIndex = 0;

            }

        }

    }


    loadSong(songIndex);

    addToRecentlyPlayed(
        songIndex
    );


    audioPlayer.play();


    updatePlayerAlbumInfo(
        songIndex
    );

}


/* =========================
   PREVIOUS SONG
========================= */

function playPrevSong() {

    if (songs.length === 0) {
        return;
    }


    if (isShuffle) {

        shuffleIndex--;


        if (shuffleIndex < 0) {

            shuffleIndex =
                shuffleQueue.length - 1;

        }


        songIndex =
            shuffleQueue[
                shuffleIndex
            ];

    }

    else {

        songIndex--;


        if (songIndex < 0) {

            songIndex =
                songs.length - 1;

        }

    }


    loadSong(songIndex);

    addToRecentlyPlayed(
        songIndex
    );


    audioPlayer.play();


    updatePlayerAlbumInfo(
        songIndex
    );

}


/* =========================
   HANDLE SONG END
========================= */

function handleSongEnd() {

    if (
        repeatMode === "one"
    ) {

        audioPlayer.currentTime = 0;

        audioPlayer.play();

    }

    else {

        playNextSong();

    }

}


/* =========================
   ALBUM INFO PANEL
========================= */

function updatePlayerAlbumInfo(index) {

    if (
        index < 0 ||
        index >= playButtons.length
    ) {

        return;

    }


    const activeCard =
        playButtons[index]
            .closest(".card");


    if (!activeCard) {
        return;
    }


    const imgSrc =
        activeCard
            .querySelector(".card-img")
            .src;


    const title =
        activeCard
            .querySelector(".card-title")
            .textContent
            .trim();


    const artist =
        activeCard
            .querySelector(".card-info")
            .textContent
            .trim();


    const isFavorited =
        favorites.has(title);


    const heartClass =
        isFavorited
            ? "fa-solid fa-heart player-fav-btn favorited"
            : "fa-regular fa-heart player-fav-btn";


    albumEl.innerHTML = `

        <img
            src="${imgSrc}"
            class="album-cover"
            alt="Cover Art">

        <div class="album-info">

            <p class="album-title">
                ${title}
            </p>

            <p class="album-artist">
                ${artist}
            </p>

        </div>

        <i
            class="${heartClass}"
            id="player-fav"
            data-title="${title}"
            title="Favorite">
        </i>

    `;


    const playerFavBtn =
        document.getElementById(
            "player-fav"
        );


    playerFavBtn.addEventListener(
        "click",
        () => {

            toggleFavorite(title);

        }
    );

}


/* =========================
   FAVORITES LOGIC
========================= */

function toggleFavorite(title) {

    if (favorites.has(title)) {

        favorites.delete(title);

    }

    else {

        favorites.add(title);

    }


    localStorage.setItem(
        "favorites",
        JSON.stringify(
            Array.from(favorites)
        )
    );


    updateFavoriteUI();

}


/* =========================
   UPDATE FAVORITE UI
========================= */

function updateFavoriteUI() {

    playButtons.forEach(
        (btn) => {

            const card =
                btn.closest(".card");


            if (card) {

                const title =
                    card
                        .querySelector(
                            ".card-title"
                        )
                        .textContent
                        .trim();


                const heart =
                    card.querySelector(
                        ".fav-btn"
                    );


                if (heart) {

                    if (
                        favorites.has(title)
                    ) {

                        heart.className =
                            "fa-solid fa-heart fav-btn favorited";

                    }

                    else {

                        heart.className =
                            "fa-regular fa-heart fav-btn";

                    }

                }

            }

        }
    );


    const playerFavBtn =
        document.getElementById(
            "player-fav"
        );


    if (playerFavBtn) {

        const title =
            playerFavBtn.dataset.title;


        if (
            favorites.has(title)
        ) {

            playerFavBtn.className =
                "fa-solid fa-heart player-fav-btn favorited";

        }

        else {

            playerFavBtn.className =
                "fa-regular fa-heart player-fav-btn";

        }

    }

    updateFavoritesList();

}


/* =========================
   VOLUME LOGIC
========================= */

function updateVolumeIcon(val) {

    volumeIcon.className =
        "fa-solid volume-icon";


    if (val == 0) {

        volumeIcon.classList.add(
            "fa-volume-xmark"
        );

    }

    else if (val < 50) {

        volumeIcon.classList.add(
            "fa-volume-low"
        );

    }

    else {

        volumeIcon.classList.add(
            "fa-volume-high"
        );

    }

}


/* =========================
   SHUFFLE TOGGLE
========================= */

shuffleBtn.addEventListener(
    "click",
    () => {

        isShuffle =
            !isShuffle;


        if (isShuffle) {

            shuffleBtn.classList.remove(
                "control-inactive"
            );

            shuffleBtn.classList.add(
                "control-active"
            );


            generateShuffleQueue(
                songIndex
            );

        }

        else {

            shuffleBtn.classList.remove(
                "control-active"
            );

            shuffleBtn.classList.add(
                "control-inactive"
            );

        }

    }
);


/* =========================
   REPEAT TOGGLE
========================= */

repeatBtn.addEventListener(
    "click",
    () => {

        if (
            repeatMode === "all"
        ) {

            repeatMode = "one";


            repeatBtn.classList.remove(
                "control-inactive"
            );

            repeatBtn.classList.add(
                "control-active"
            );


            repeatIndicator.classList.remove(
                "hidden"
            );


            repeatBtn.title =
                "Repeat One";

        }

        else if (
            repeatMode === "one"
        ) {

            repeatMode = "off";


            repeatBtn.classList.remove(
                "control-active"
            );

            repeatBtn.classList.add(
                "control-inactive"
            );


            repeatIndicator.classList.add(
                "hidden"
            );


            repeatBtn.title =
                "Repeat Off";

        }

        else {

            repeatMode = "all";


            repeatBtn.classList.remove(
                "control-inactive"
            );

            repeatBtn.classList.add(
                "control-active"
            );


            repeatIndicator.classList.add(
                "hidden"
            );


            repeatBtn.title =
                "Repeat All";

        }

    }
);


/* =========================
   VOLUME CONTROLS
========================= */

volumeBar.addEventListener(
    "input",
    (e) => {

        const val =
            e.target.value;


        audioPlayer.volume =
            val / 100;


        updateVolumeIcon(val);


        if (val > 0) {

            previousVolume =
                val / 100;

        }

    }
);


volumeIcon.addEventListener(
    "click",
    () => {

        if (
            audioPlayer.volume > 0
        ) {

            previousVolume =
                audioPlayer.volume;


            audioPlayer.volume = 0;

            volumeBar.value = 0;

            updateVolumeIcon(0);

        }

        else {

            audioPlayer.volume =
                previousVolume;


            volumeBar.value =
                previousVolume * 100;


            updateVolumeIcon(
                previousVolume * 100
            );

        }

    }
);


/* =========================
   SEARCH FILTERING
========================= */

searchInput.addEventListener(
    "input",
    (e) => {

        const query =
            e.target.value
                .toLowerCase()
                .trim();


        const containers =
            document.querySelectorAll(
                ".card-container"
            );


        containers.forEach(
            (container) => {

                const cards =
                    container.querySelectorAll(
                        ".card"
                    );


                let visibleCount = 0;


                cards.forEach(
                    (card) => {

                        const titleEl =
                            card.querySelector(
                                ".card-title"
                            );


                        const infoEl =
                            card.querySelector(
                                ".card-info"
                            );


                        const title =
                            titleEl
                                ? titleEl.textContent.toLowerCase()
                                : "";


                        const info =
                            infoEl
                                ? infoEl.textContent.toLowerCase()
                                : "";


                        if (
                            title.includes(query) ||
                            info.includes(query)
                        ) {

                            card.classList.remove(
                                "search-hidden"
                            );

                            visibleCount++;

                        }

                        else {

                            card.classList.add(
                                "search-hidden"
                            );

                        }

                    }
                );


                const header =
                    container.previousElementSibling;


                if (
                    visibleCount === 0
                ) {

                    container.classList.add(
                        "search-hidden"
                    );


                    if (
                        header &&
                        header.tagName === "H2"
                    ) {

                        header.classList.add(
                            "search-hidden"
                        );

                    }

                }

                else {

                    container.classList.remove(
                        "search-hidden"
                    );


                    if (
                        header &&
                        header.tagName === "H2"
                    ) {

                        header.classList.remove(
                            "search-hidden"
                        );

                    }

                }

            }
        );

    }
);


/* =========================
   INITIALIZATION
========================= */

function init() {

    playButtons.forEach(
        (btn) => {

            const card =
                btn.closest(".card");


            if (card) {

                const imgContainer =
                    card.querySelector(
                        ".card-img-container"
                    );


                if (
                    imgContainer &&
                    !imgContainer.querySelector(
                        ".fav-btn"
                    )
                ) {

                    const heartIcon =
                        document.createElement(
                            "i"
                        );


                    heartIcon.className =
                        "fa-regular fa-heart fav-btn";


                    imgContainer.appendChild(
                        heartIcon
                    );

                }

            }

        }
    );


    playButtons.forEach(
        (btn) => {

            const card =
                btn.closest(".card");


            if (card) {

                const heart =
                    card.querySelector(
                        ".fav-btn"
                    );


                if (heart) {

                    heart.addEventListener(
                        "click",
                        (e) => {

                            e.stopPropagation();


                            const title =
                                card
                                    .querySelector(
                                        ".card-title"
                                    )
                                    .textContent
                                    .trim();


                            toggleFavorite(
                                title
                            );

                        }
                    );

                }

            }

        }
    );


    audioPlayer.volume = 1.0;

    volumeBar.value = 100;

    updateVolumeIcon(100);



    updateFavoritesList();


    updateRecentlyPlayedList();



    updateFavoriteUI();



    updatePlayerAlbumInfo(
        songIndex
    );

}


init();