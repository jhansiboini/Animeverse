const form=document.querySelector('form');
const container=document.querySelector('.card-container');
const logo = document.getElementById("anime");

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let query=form.querySelector('input').value.trim();

    if (query === "") {
        alert("please enter search term");
        return;
    }
    animeApi(query)

})

async function animeApi(query) {
    try {
        const req = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${query}`);
        const res = await req.json();
        const anime = res.data;

        if (anime.length === 0) {
            alert("No results found.")
        } else {
            logo.style.display = "none"; // Hide logo when search is performed
            animeContent(anime);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Something went wrong. Please try again.")
    }
}
// Fetch genre for an individual anime by ID
async function fetchGenres(id) {
    try {
        const greq = await fetch(`https://kitsu.io/api/edge/anime/${id}/genres`);
        const gres = await greq.json();
        const genreList = gres.data.map(genre => genre.attributes.name);
        return genreList.length > 0 ? genreList.join(', ') : "";
    } catch (error) {
        console.error(`Failed to fetch genres for anime ID ${id}`, error);
        return "Unknown";
    }
}

async function animeContent(anime) {
    container.innerHTML = "";

    let content = "";

    for (let a of anime) {

        const id = a.id;
        // Fetch genres for this anime
        const genres = await fetchGenres(id);

        let src = a.attributes.posterImage.small;
        let title = a.attributes.canonicalTitle;
        let synops = a.attributes.synopsis;
        let epcount=a.attributes.episodeCount;
        let rating = a.attributes.averageRating;
        let videoid = a.attributes.youtubeVideoId;
        let video = `https://www.youtube.com/embed/${videoid}`;

        let shortSynops = synops.length > 500? synops.slice(0, 500) + "..." : synops;
        let needsToggle = synops.length > 500;

        content += `
        <div class="card mb-3 container">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${src}" class="img-fluid rounded" alt="Poster of ${title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        ${genres ? `<p class="card-text"><span class="sideheadings">Genre :</span>  ${genres}</p>` : ""}
                        <p class="card-text">
                            <span class="short-synopsis">${shortSynops}</span>
                            <span class="full-synopsis d-none">${synops}</span>
                            ${needsToggle ? `<a href="#" class="toggle-synopsis" style="color: rgb(199, 100, 199); text-decoration: underline;">Read More</a>` : ""}
                        </p>
                        ${epcount ? `<p class="card-text"><span class="sideheadings">Total Episodes :</span> ${epcount}</p>` : ""}
                        ${rating ? `<p class="card-text"><span class="sideheadings">Rating:</span> ⭐${rating}/10</p>` : ""}
                        ${videoid ? `<a href="${video}" target="_blank"><button class="button">Trailer</button></a>` : ""}
                    </div>
                </div>
            </div>
        </div>`;
    }

    container.innerHTML = content;

    // Add toggle behavior
    const toggles = document.querySelectorAll('.toggle-synopsis');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const shortText = this.previousElementSibling.previousElementSibling;
            const fullText = this.previousElementSibling;
            if (fullText.classList.contains('d-none')) {
                shortText.style.display = "none";
                fullText.classList.remove('d-none');
                this.textContent = "Read Less";
            } else {
                shortText.style.display = "inline";
                fullText.classList.add('d-none');
                this.textContent = "Read More";
            }
        });
    });
}


