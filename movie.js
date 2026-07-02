/* 
   MOVIE / TV DETAILS PAGE SCRIPT
   Reuses the same TMDB API key / fetch pattern as script.js
    */

let api_key = '50e49373c2098323b103d3c5f02f42c8';
let detailsContainer = document.getElementById('movieDetailsContainer');

//HELPERS

// Reads "id" and "type" query params from the URL
// e.g. movie.html?id=550&type=movie
function getParamsFromURL() {
  let params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id'),
    // Defaults to "movie" so old links like movie.html?id=550 still work
    type: params.get('type') || 'movie'
  };
}

// Returns "Not Available" for any missing/empty/null/undefined value,
// otherwise returns the value unchanged. Used everywhere we render a field.
function orNotAvailable(value) {
  if (value === undefined || value === null || value === '') {
    return "Not Available";
  }
  return value;
}

// Converts a runtime in minutes (e.g. 139) into "2h 19m".
// Accepts either a plain number (movies) or an array (tv episode_run_time).
function formatRuntime(runtimeValue) {
  let minutes = Array.isArray(runtimeValue) ? runtimeValue[0] : runtimeValue;
  if (!minutes) return "Not Available";
  let hrs = Math.floor(minutes / 60);
  let mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

// Converts TMDB's genres array [{id, name}, ...] into "Action, Drama"
function formatGenres(genres) {
  if (!genres || genres.length === 0) return "Not Available";
  return genres.map((g) => g.name).join(', ');
}

// Converts a vote average number into a display string, e.g. 7.4
function formatRating(rating) {
  if (rating === undefined || rating === null || rating === 0) return "Not Available";
  return rating;
}

// FETCH DETAILS (same fetch/then/catch shape as script.js) 
function fetchDetails(id, type) {
  // "movie" -> /movie/{id}, "tv" -> /tv/{id}
  let endpoint = type === 'tv' ? 'tv' : 'movie';
  let url = `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${api_key}&language=en-US`;
  console.log(url);

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        const message = `A error occured ${response.status}`;
        throw new Error(message);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      renderDetails(data, type);
    })
    .catch((error) => {
      console.log(error);
      detailsContainer.innerHTML = `<p class="loadingText">Could not load details. Please go back and try again.</p>`;
    });
}

/* 
   RENDER DETAILS
   Movies and TV shows use different field names for a few things
   (title/name, release_date/first_air_date, runtime/episode_run_time),
   so we normalize them here before rendering.
     */
function renderDetails(data, type) {
  let posterPath = data.poster_path
    ? `http://image.tmdb.org/t/p/w500/${data.poster_path}`
    : "";

  let title = type === 'tv' ? data.name : data.title;
  let releaseDate = type === 'tv' ? data.first_air_date : data.release_date;
  let runtime = type === 'tv' ? data.episode_run_time : data.runtime;

  detailsContainer.innerHTML = `
    <div class="posterBox">
      ${posterPath
        ? `<img src="${posterPath}" alt="poster" />`
        : `<div class="noPoster">Not Available</div>`}
    </div>
    <div class="infoBox">
      <h1>${orNotAvailable(title || data.original_title || data.original_name)}</h1>
      <p class="overview">${orNotAvailable(data.overview)}</p>
      <ul class="metaList">
        <li><strong>Genres:</strong> ${formatGenres(data.genres)}</li>
        <li><strong>Release Date:</strong> ${orNotAvailable(releaseDate)}</li>
        <li><strong>Rating:</strong> ${formatRating(data.vote_average)}</li>
        <li><strong>Runtime:</strong> ${formatRuntime(runtime)}</li>
        <li><strong>Original Language:</strong> ${orNotAvailable(data.original_language)}</li>
        <li><strong>Status:</strong> ${orNotAvailable(data.status)}</li>
      </ul>
    </div>
  `;
}

//INIT
let params = getParamsFromURL();

if (!params.id) {
  detailsContainer.innerHTML = `<p class="loadingText">No title selected. <a href="index.html">Go back home</a></p>`;
} else {
  fetchDetails(params.id, params.type);
}