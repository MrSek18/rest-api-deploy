const express = require('express');
const crypto = require('node:crypto');
const movies = require('./movies.json')
const cors = require('cors')
const z = require('zod');
const { validateHeaderName } = require('node:http');

const {validateMovie,validatePartialMovie} = require('./schemas/movies')

const app = express();

app.use(cors());


app.disable('x-powered-by'); 

app.get('/', (req, res) => {
    res.json({mensaje: 'hola mundo'});
});




// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) =>{

    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
            // movie => movie.genre.includes(genre)
        )
        return res.json(filteredMovies)
    }


    res.json(movies)
})


app.get('/movies/:id', (req, res) => {

    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie); 

    res.status(404).json({ message: 'Movie Not Found'})


});


app.post('/movies', (req, res) => {
    // const movieSchema = z.object({
    //     title: z.string({
    //         invalid_type_error: 'Movie title must be a string',
    //         required_error: 'Movie title is required. Please, check url and body'
    //     }),
    //     year: z.number().int().positive().min(1900).max(2022),
    //     director: z.string(),
    //     duration: z.number().int().positive(),
    //     rate: z.number().positive().max(10),
    //     poster: z.string().url({
    //         message: 'Poster must be a valid URL'
    //     }),
    //     genre: 
    //         z.enum(['action', 'comedy', 'drama', 'horror', 'romance', 'sci-fi', 'thriller', 'Sci-Fi'],{
    //             required_error: 'Movie genre is required',
    //             invalid_type_error: 'Movie genre must be an array of enum Genre'
    //         }).array()
        
    // })


    // const {
    //     title,  // <- Asegúrate de que este nombre coincida con el cuerpo de la solicitud
    //     genre,
    //     year,
    //     director,
    //     duration,        
    //     rate,
    //     poster
    // } = req.body;

    const result = validateMovie(req.body)

    if (result.error){
        // 422 Unprocessable Entity
        return res.status(400).json({error: JSON.parse(result.error.message)}) 
    }

    const newMovie = {
        id: crypto.randomUUID(), // Genera un ID v4
        // title,  // <- Asegúrate de que este nombre coincida con el cuerpo de la solicitud
        // genre,
        // director,
        // year,
        // duration,
        // rate: rate ?? 0,
        // poster
        ...result.data
    };

    console.log('Nueva película:', newMovie); // Verificar el objeto newMovie

    movies.push(newMovie);

    res.status(201).json(newMovie); // Actualiza la caché del cliente
});



app.delete('/movies/:id', (req, res) => {

    // const origin = req.header('origin');
    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin);
    // }

    const { id } = req.params;
    console.log('ID to delete:', id); // Log de depuración
    console.log('Movies before deletion:', movies); // Log de depuración

    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie Not Found' });
    }

    movies.splice(movieIndex, 1);
    console.log('Movies after deletion:', movies); // Log de depuración
    return res.json({ message: 'Movie deleted' });
});




app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);


    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie Not Found' });
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(movies[movieIndex])
});




const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});


