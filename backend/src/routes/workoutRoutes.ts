// Importiamo Express per definire i percorsi (endpoint)
import express from 'express';
// Importiamo le funzioni (gli Chef) dal controller che abbiamo scritto
import { 
    createWorkout, 
    getWorkouts, 
    getWorkoutById, 
    deleteWorkout,
    createTemplate,
    getTemplates
} from '../controllers/workoutController.js';
// Importiamo il buttafuori che abbiamo creato
import { authenticateToken } from '../middlewares/authMiddleware.js';

// Inizializziamo il router di Express
const router = express.Router();

// Applichiamo il buttafuori a TUTTE le rotte che seguono in questo file.
// Nessuno può passare oltre questo punto se non ha un token valido!
router.use(authenticateToken);

// Quando arriva una richiesta POST a "/workouts/", chiama la funzione createWorkout
router.post('/', createWorkout);

// Per creare una nuova scheda
router.post('/templates', createTemplate);

// Quando arriva una richiesta GET a "/workouts/", chiama getWorkouts (prendi tutti)
router.get('/', getWorkouts);

// Quando arriva GET a "/workouts/ID_SPECIFICO", prende solo quell'allenamento
router.get('/:id', getWorkoutById);

// Per recuperare tutte le schede dell'utente
router.get('/templates', getTemplates);

// Quando arriva DELETE a "/workouts/ID_SPECIFICO", cancella quell'allenamento
router.delete('/:id', deleteWorkout);



// Esportiamo il router per collegarlo al server principale (index.ts)
export default router;
