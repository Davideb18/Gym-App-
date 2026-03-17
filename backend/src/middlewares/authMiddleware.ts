// Importiamo i tipi necessari da Express per gestire richieste, risposte e la funzione 'next'
import type { Request, Response, NextFunction } from 'express';
// Importiamo la libreria jsonwebtoken per verificare la validità del token JWT
import jwt from 'jsonwebtoken';

// Definiamo la chiave segreta (deve essere identica a quella usata nel login/registrazione)
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'supersecret';

// Estendiamo l'interfaccia Request di Express per poterci aggiungere la proprietà 'userId'
// In questo modo, una volta autenticato, l'ID dell'utente sarà disponibile in tutti i controller
export interface AuthRequest extends Request {
  userId?: string; // Il punto di domanda indica che è opzionale (ci sarà solo se l'utente è loggato)
}

// --- QUESTA FUNZIONE CONTROLLA SE L'UTENTE È AUTENTICATO
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Cerchiamo l'header 'Authorization' nella richiesta (di solito è "Bearer TOKEN")
  const authHeader = req.headers['authorization'];
  // Se l'header esiste, prendiamo solo la seconda parte (il token vero e proprio), altrimenti undefined
  const token = authHeader && authHeader.split(' ')[1];

  // Se il token non è presente, rispondiamo con errore 401 (Non Autorizzato)
  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  try {
    // Verifichiamo il token usando la nostra chiave segreta
    // Se è valido, 'decoded' conterrà i dati che abbiamo salvato nel token (come l'userId)
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
};
    
    // Salviamo l'userId dentro l'oggetto della richiesta (req)
    // Così il prossimo "chef" (il controller) saprà quale utente sta scrivendo
    req.userId = decoded.sub;
    
    // 'next()' dice a Express di passare alla funzione successiva (la rotta o il controller)
    next();
  } catch (error) {
    // Se il token è scaduto o manipolato, rispondiamo con errore 403 (Proibito)
    return res.status(403).json({ error: 'Token non valido' });
  }
};
