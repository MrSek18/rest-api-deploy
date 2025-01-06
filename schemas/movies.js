const z = require('zod');

const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'Movie title must be a string',
            required_error: 'Movie title is required. Please, check url and body'
        }),
        year: z.number().int().positive().min(1900).max(2022),
        director: z.string(),
        duration: z.number().int().positive(),
        rate: z.number().positive().max(10).default(5),
        poster: z.string().url({
            message: 'Poster must be a valid URL'
        }),
        genre: 
            z.enum(['action', 'comedy', 'Drama', 'horror', 'Crime', 'romance', 'sci-fi', 'thriller', 'Sci-Fi'],{
                required_error: 'Movie genre is required',
                invalid_type_error: 'Movie genre must be an array of enum Genre'
            }).array()
        
    })

function validateMovie (object){
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object){
    return movieSchema.partial().safeParse(object)
}
    
module.exports = {
    validateMovie,
    validatePartialMovie
}