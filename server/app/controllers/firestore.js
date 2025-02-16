const { httpError } = require('../helpers/handleError');
const { firestore } = require('../../config/firebase');

// Agregar un documento a Firestore
const addDocument = async (req, res) => {
    try {
        const { collection, data } = req.body;

        if (!collection || !data) {
            return res.status(400).json({ error: 'Se requiere la colección y los datos' });
        }

        const docRef = await firestore.collection(collection).add(data);
        
        res.status(201).json({ 
            message: 'Documento agregado exitosamente en Firestore',
            id: docRef.id 
        });
    } catch (e) {
        console.error('Error en addDocument:', e);
        httpError(res, e);
    }
};

// Obtener todos los documentos de una colección
const getDocuments = async (req, res) => {
    try {
        const { collection } = req.params;
        const snapshot = await firestore.collection(collection).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No hay documentos en esta colección' });
        }

        const documentos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ data: documentos });
    } catch (e) {
        console.error('Error en getDocuments:', e);
        httpError(res, e);
    }
};

module.exports = {
    addDocument,
    getDocuments
};
