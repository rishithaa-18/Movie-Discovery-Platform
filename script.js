// MOBILE MENU TOGGLE 

let toggleMenu = document.querySelector(".toggle");
toggleMenu.addEventListener("click", () => {
  console.log("clicked");
  let ul = document.querySelector(".bottomHeader");
  ul.classList.toggle("show");
  toggleMenu.classList.toggle("fa-xmark");
  ul.classList.add("bg");
});

//GLOBAL STATE / CONSTANTS 
let tv = document.getElementById("tv");
let i = 1;
let api_key = '50e49373c2098323b103d3c5f02f42c8';
let url = `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=en-US&page=${i}`;
let z = 0;

// The single .container element that all movie/tv cards are rendered into.
// Grabbed once here so the click-delegation listener below always works,
// even though its innerHTML gets replaced every time new results load.
let container = document.querySelector(".container");

/* NAVIGATION TO MOVIE DETAILS PAGE */
// One delegated listener handles clicks on ANY card (movie or tv show),
// current or future, without needing to attach a listener per-card.
container.addEventListener("click", handleCardClick);

function handleCardClick(event) {
  // Find the closest ancestor .box element that was clicked
  let card = event.target.closest(".box");
  if (card && card.dataset.movieId) {
    // data-media-type is "movie" or "tv" so movie.html knows which
    // TMDB endpoint to call. Defaults to "movie" if not set.
    let mediaType = card.dataset.mediaType || "movie";
    redirectToMovieDetails(card.dataset.movieId, mediaType);
  }
}

// Sends the user to movie.html carrying the TMDB id + media type as URL params
function redirectToMovieDetails(movieId, mediaType) {
  window.location.href = `movie.html?id=${movieId}&type=${mediaType}`;
}

//EVENT LISTENERS FOR HEADER CONTROLS
let search = document.querySelector('#searchBtn');
search.addEventListener('click', search_movie);

let popular = document.querySelector('#popular');
popular.addEventListener('click', popular_data);

let showMore = document.querySelector('#showMore');
showMore.addEventListener('click', nextData);

let upcomingMovies = document.querySelector('#upcoming');
upcomingMovies.addEventListener('click', upcoming);

let newMovies = document.querySelector('#new');
newMovies.addEventListener('click', newmovies);

let tvShows = document.querySelector('#tv');
tvShows.addEventListener('click', tvshows);

// Load popular movies on first page load
fetchData();

// BUTTON HANDLERS - set state flags then fetch
function search_movie() {
  let query = document.querySelector('#query').value;
  console.log(query);
  z = -1;
  url = "https://api.themoviedb.org/3/search/movie?api_key=50e49373c2098323b103d3c5f02f42c8&language=en-US&query=" + query + "&page=1&include_adult=false";
  fetchData();
}

function nextData() {
  console.log('clicked');
  i++;
  z = 0;
  url = `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=en-US&page=${i}`;
  fetchData();
}

function upcoming() {
  console.log('clicked');
  i++;
  z = 1;
  fetchData();
}

function newmovies() {
  console.log('clicked');
  i++;
  z = 2;
  fetchData();
}

function tvshows() {
  console.log('clicked');
  i++;
  fetchDatatv();
}

function popular_data() {
  console.log('clicked');
  i++;
  z = 3;
  fetchData();
}

//FETCH MOVIES (popular / upcoming / new / search)
function fetchData() {
  if (z === 0) {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=en-US&page=${i}`;
  } else if (z === 1) {
    url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${api_key}&language=en-US&page=${i}`;
  } else if (z === 2 || z === 3) {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=en-US&page=${i}`;
  }
  console.log(url);
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        i++;
        const message = `A error occured ${response.status}`
        throw new Error(message);
        console.log(Error(message));
      }
      return response.json();
    })
    .then((movies) => {
      console.log(movies);
      let myLen = movies.results.length;
      if (z === 1 || z === 2 || z === 3 || z == -1) {
        container.innerHTML = ``;
      }
      if (z === 3) {
        i = 1;
      }
      showMovies();

      // Renders each movie result as a clickable card
      function showMovies() {
        if (myLen === 0) {
          container.innerHTML = `<div class="moviesDetails">
          <div class="leftDetails">
            <h5>No Results Found</h5>
          </div>
        </div>
      </div>`
        }
        for (var j = 0; j < myLen; j++) {
          let movie = movies.results[j];
          // data-movie-id is what handleCardClick() reads to build the
          // movie.html?id=... link when this card is clicked
          container.innerHTML += `<div class="box" data-movie-id="${movie.id}" data-media-type="movie">
      <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="poster" />
  <div class="moviesDetails">
    <div class="leftDetails">
      <h5>${movie.original_title}</h5>
      <p>${movie.release_date}</p>
    </div>
    <div class="rightDetails rating">${movie.vote_average}</div>
  </div>
</div>`;
        }
      }
    })
    .catch((error) => {
      error.message;
      console.log(error);
    })
}

// FETCH TV SHOWS
function fetchDatatv() {
  url = `https://api.themoviedb.org/3/tv/popular?api_key=${api_key}&language=en-US&page=${i}`;
  console.log(url);
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        i++;
        const message = `A error occured ${response.status}`
        throw new Error(message);
        console.log(Error(message));
      }
      return response.json();
    })
    .then((tv) => {
      console.log(tv);
      let myLen = tv.results.length;
      container.innerHTML = ``;
      showtv();

      // Renders each tv show result as a clickable card.
      // NOTE: TV show ids are looked up via TMDB's /tv/{id} endpoint,
      // which is different from movie.html's /movie/{id} fetch below.
      // Clicking a TV card will currently 404 on movie.html - see chat
      // notes for how to extend this if TV details are needed too.
      function showtv() {
        for (var j = 0; j < myLen; j++) {
          let tvi = tv.results[j];
          container.innerHTML += `<div class="box" data-movie-id="${tvi.id}" data-media-type="tv">
    <img src="http://image.tmdb.org/t/p/w500/${tvi.poster_path}" alt="img" />
<div class="moviesDetails">
  <div class="leftDetails">
    <h5>${tvi.name}</h5>
    <p>${tvi.first_air_date}</p>
  </div>
  <div class="rightDetails rating">${tvi.vote_average}</div>
</div>
</div>`;
        }
      }
    })
    .catch((error) => {
      error.message;
      console.log(error);
    })
}