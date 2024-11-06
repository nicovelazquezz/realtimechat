const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Almacenar usuarios conectados
const usuarios = new Map();

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejar el registro de usuario
    socket.on('registrar usuario', (nombre) => {
        usuarios.set(socket.id, nombre);
        // Emitir lista actualizada de usuarios
        io.emit('usuarios conectados', Array.from(usuarios.values()));
        // Mensaje de bienvenida
        socket.broadcast.emit('mensaje', {
            usuario: 'Sistema',
            texto: `${nombre} se ha unido al chat`
        });
    });

    // Manejar mensajes nuevos
    socket.on('enviar mensaje', (mensaje) => {
        const usuario = usuarios.get(socket.id);
        io.emit('mensaje', {
            usuario: usuario,
            texto: mensaje
        });
    });

    // Manejar escribiendo...
    socket.on('escribiendo', () => {
        const usuario = usuarios.get(socket.id);
        socket.broadcast.emit('usuario escribiendo', usuario);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        const usuario = usuarios.get(socket.id);
        if (usuario) {
            usuarios.delete(socket.id);
            io.emit('usuarios conectados', Array.from(usuarios.values()));
            io.emit('mensaje', {
                usuario: 'Sistema',
                texto: `${usuario} ha abandonado el chat`
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});