//Constantes
const APIKEY = "84d958ddb5ce9c8efed0559af531ce1f"
let baseURL = 'https://api.themoviedb.org/3/';
let baseURLimage = 'https://image.tmdb.org/t/p/w500/';
async function hide() {
    var x = document.getElementById("answer");
    if (x.style.display !== "none") {
        x.style.display = "block";
        document.getElementById("play").style.display = "none"

        await initialisation()
        statusgame = "find_actor";
    } else {
        x.style.display = "none";
    }
}
// Cette fonction récupère la liste des acteurs/réalisateurs ayant diriger ou jouer dans un film
const getPeople = async(id_movie) => {
        let url = ''.concat(baseURL, 'movie/', id_movie, '/casts?api_key=', APIKEY);
        const data = await (await fetch(url)).json();
        let validName = [];
        data.cast.forEach(item => {
            if (item.known_for_department == "Acting" || item.known_for_department == "Directing") {
                var index = validName.findIndex(x => x[0] == item.id);
                if (index === -1) {
                    validName.push([item.id, item.name, item.profile_path])
                }
            }
        })

        data.crew.forEach(item => {

            if (item.known_for_department == "Acting" || item.known_for_department == "Directing") {
                var index = validName.findIndex(x => x[0] == item.id);
                if (index === -1) {
                    validName.push([item.id, item.name, item.profile_path])

                }
            }
        })
        return validName;

    }
    // Cette fonction récupère la liste des films à partir d'un keyword
const getMovie = async(keyword) => {
    let url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', keyword);
    const data = await (await fetch(url)).json();
    let movielist = [];
    data.results.forEach(item => {
        var index = movielist.findIndex(x => x[0] == item.id);
        if (index === -1) {
            movielist.push([item.id, item.original_title, item.poster_path, item.release_date])
        }
    })
    return movielist;

}
const getMoviebyId = async(id_movie) => {
        let url = ''.concat(baseURL, 'movie/', id_movie, '?api_key=', APIKEY);
        const data = await (await fetch(url)).json();
        return { id: data.id, title: data.original_title, poster_path: data.poster_path, release_date: data.release_date }
    }
    // Cette fonction récupère les films dans lequel un acteur à pu jouer
const actorMovies = async(id_actorlists) => {
        let url = ''.concat(baseURL, 'person/', id_actorlists, '/movie_credits?api_key=', APIKEY);
        const data = await (await fetch(url)).json();
        let actorlist = [];

        data.cast.forEach(item => {
            var index = actorlist.findIndex(x => x[1] == item.title);
            if (index === -1) {
                actorlist.push([item.id, item.title, item.backdrop_path, item.release_date])
            } else {
                if (actorlist[index][2] == undefined) {
                    actorlist[index] = [item.id, item.title, item.backdrop_path, item.release_date]
                }
            }
        })
        data.crew.forEach(item => {
            var index = actorlist.findIndex(x => x[1] == item.original_title);
            if (index === -1) {
                actorlist.push([item.id, item.title, item.profile_path, item.release_date])
            } else {

                if (actorlist[index][2] == undefined) {
                    actorlist[index] = [item.id, item.title, item.profile_path, item.release_date]
                }
            }
        })
        return actorlist;

    }
    // Permet d'afficher l'image dans le template du quizz
function displayimage(url) {

    const image = document.getElementById("img")
    image.src = ''.concat(baseURLimage, url);

}
// Permet d'afficher la template de movie dans le quizz
function displaymovie(movie) {
    document.getElementById("info-champ").innerHTML = ""
    document.getElementById("question").innerHTML = movie.title;
    document.getElementById("date").innerHTML = "La date de sortie du film :".concat(movie.release_date);
    displayimage(movie.poster_path);

}

function displayactor(actor) {
    document.getElementById("info-champ").innerHTML = ""
    document.getElementById("question").innerHTML = actor[1];
    document.getElementById("date").innerHTML = "";
    displayimage(actor[2]);
}
// Fonction qui verifie si l'utilisateur a entrée un bon acteur/producteur
function verifyActor(actorlist) {

    var input = document.getElementById("input").value
    var index = actorlist.findIndex(x => x[1] == input);
    if (index !== -1) {
        displayactor(actorlist[index])
        statusgame = "find_movie"
    } else {
        document.getElementById("info-champ").innerHTML = "L'acteur ne joue pas dans le film";
    }
    actor = actorlist[index]

}
// Fonction qui verifie si l'utilisateur a entrée un film joue/produit par l'acteur
async function verifyMovie() {
    var input = document.getElementById("input").value
    var index = moviesActor.findIndex(x => x[1] == input);

    if (index !== -1) {
        var index2 = moviesdead.findIndex(x => x == input);
        if (index2 === -1) {
            movie = await getMoviebyId(moviesActor[index][0])
            moviesdead.push(movie.title)
            displaymovie(movie)
            statusgame = "find_actor"
        } else {
            document.getElementById("info-champ").innerHTML = "Le film a déja été entré";
        }
    } else {
        document.getElementById("info-champ").innerHTML = "Le film n'a pas été joué ou produit par " + actor[1];
    }
}

//Variable
var movie, actorlist, moviesActor, actor
var statusgame = "init";

const id_movie = '500';
var moviesdead = ["Reservoir Dogs"]; // Ici on définie l'id de base ainsi le quizz débutera toujours par ce film


async function initialisation() {
    movie = await getMoviebyId(id_movie)
    displaymovie(movie)
    statusgame = "find_actor";
    document.getElementById("info-champ").innerHTML = ""

}
async function play() {
    //Initialise le quizz

    switch (statusgame) {


        case "find_actor":
            actorlist = await getPeople(movie.id)
            verifyActor(actorlist)
            document.getElementById("input").value = ""
            break;

        case "find_movie":
            document.getElementById("info-champ").innerHTML = ""
            moviesActor = await actorMovies(actor[0])
            verifyMovie()
            document.getElementById("input").value = ""
            break;

        default:
            alert("Error")
            break;
    }

}