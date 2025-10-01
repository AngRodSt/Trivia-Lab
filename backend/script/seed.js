import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";

dotenv.config();

// 🔄 Función para mezclar las opciones y ajustar la respuesta correcta
function mezclarOpciones(pregunta) {
  const opciones = [...pregunta.options];
  const respuestaCorrecta = pregunta.correctAnswer;

  // Crear array de índices para mezclar
  const indices = [0, 1, 2, 3];

  // Algoritmo Fisher-Yates para mezclar
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Reorganizar opciones según los índices mezclados
  const opcionesMezcladas = indices.map((i) => opciones[i]);

  // Encontrar la nueva posición de la respuesta correcta
  const nuevaPosicionCorrecta = indices.indexOf(respuestaCorrecta);

  return {
    text: pregunta.text,
    options: opcionesMezcladas,
    correctAnswer: nuevaPosicionCorrecta,
    difficulty: pregunta.difficulty,
    category: pregunta.category,
  };
}

const categorias = [
  "Programación",
  "Bases de Datos",
  "Redes",
  "Sistemas Operativos",
  "Seguridad Informática",
  "Inteligencia Artificial",
  "Desarrollo Web",
  "Ingeniería de Software",
  "Hardware",
  "Historia de la Computación",
];

const preguntasPorCategoria = {
  Programación: [
    {
      text: "¿Qué significa OOP?",
      options: [
        "Object Oriented Programming",
        "Optimal Output Processing",
        "Open Operating Platform",
        "Only One Program",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué lenguaje introdujo el concepto de clases?",
      options: ["Simula", "C", "Java", "Python"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué retorna una función sin 'return' en Python?",
      options: ["None", "0", "Error", "False"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué estructura sigue LIFO?",
      options: ["Stack", "Queue", "Array", "Tree"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa '===' en JavaScript?",
      options: [
        "Igualdad estricta",
        "Asignación",
        "Comparación débil",
        "Concatenación",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El paradigma funcional evita:",
      options: [
        "Mutación de estado",
        "Uso de funciones",
        "Recursión",
        "Compilación",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un 'segfault'?",
      options: [
        "Acceso inválido a memoria",
        "Error de compilación",
        "Loop infinito",
        "Problema de red",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa 'recursión'?",
      options: [
        "Función que se llama a sí misma",
        "Función que nunca retorna",
        "Función de orden superior",
        "Bucle infinito",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué lenguaje creó Guido van Rossum?",
      options: ["Python", "Ruby", "Perl", "Go"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un closure en JS?",
      options: [
        "Función con acceso a su entorno léxico",
        "Objeto que guarda estado",
        "Clase anónima",
        "Método estático",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "En C, 'malloc' sirve para:",
      options: [
        "Reservar memoria",
        "Liberar memoria",
        "Llamar funciones",
        "Asignar variables",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué algoritmo ordena en O(n log n)?",
      options: ["MergeSort", "BubbleSort", "InsertionSort", "CountingSort"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué hace 'git commit'?",
      options: [
        "Guarda cambios en repositorio local",
        "Sube código a la nube",
        "Deshace cambios",
        "Crea rama",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El lenguaje Haskell es:",
      options: [
        "Funcional puro",
        "Imperativo",
        "Orientado a objetos",
        "De marcado",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa SQL?",
      options: [
        "Structured Query Language",
        "System Quality Logic",
        "Software Query List",
        "Sequential Quick Language",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué estructura es FIFO?",
      options: ["Queue", "Stack", "Tree", "Heap"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es Big O?",
      options: [
        "Medida de complejidad algorítmica",
        "Error de sintaxis",
        "Tipo de dato",
        "Nombre de librería",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa 'duck typing'?",
      options: [
        "El tipo se deduce por comportamiento",
        "Tipado fuerte",
        "Tipado estático",
        "Conversión de tipos",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un deadlock?",
      options: [
        "Bloqueo mutuo entre procesos",
        "Error de compilación",
        "Loop infinito",
        "Stack overflow",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa REPL?",
      options: [
        "Read-Eval-Print Loop",
        "Run Every Program Line",
        "Recursive Execution Program Logic",
        "Random Entry Print Loop",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué hace 'npm install'?",
      options: [
        "Instala dependencias",
        "Crea repositorio",
        "Ejecuta servidor",
        "Compila código",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El lenguaje C fue diseñado por:",
      options: [
        "Dennis Ritchie",
        "Ken Thompson",
        "Alan Turing",
        "James Gosling",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un puntero?",
      options: [
        "Variable que guarda direcciones",
        "Variable global",
        "Referencia circular",
        "Método virtual",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es 'memoization'?",
      options: [
        "Técnica de optimización con caché",
        "Error de memoria",
        "Compilación anticipada",
        "Uso de punteros",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es un intérprete?",
      options: [
        "Ejecuta código línea por línea",
        "Traduce a binario directamente",
        "Optimiza compilación",
        "Convierte SQL a API",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
  ],

  "Bases de Datos": [
    {
      text: "¿Qué significa SQL?",
      options: [
        "Structured Query Language",
        "System Query Logic",
        "Sequential Query Line",
        "Standard Query Language",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es una clave primaria?",
      options: [
        "Un índice duplicado",
        "Un identificador único de registros",
        "Una clave externa",
        "Un valor nulo",
      ],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Qué diferencia principal tiene NoSQL?",
      options: [
        "Usa tablas",
        "Es más rápido",
        "No tiene esquema rígido",
        "No usa índices",
      ],
      correctAnswer: 2,
      difficulty: "medium",
    },
    {
      text: "¿Qué relación usa tabla intermedia?",
      options: ["Uno a uno", "Uno a muchos", "Muchos a muchos", "Ninguna"],
      correctAnswer: 2,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando inserta datos en SQL?",
      options: ["ADD", "INSERT INTO", "UPDATE", "CREATE"],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Qué motor usa MySQL por defecto?",
      options: ["InnoDB", "Postgres", "SQLite", "Oracle"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es normalización?",
      options: [
        "Dividir tablas para reducir redundancia",
        "Unir tablas para rapidez",
        "Eliminar claves",
        "Duplicar índices",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué base de datos usa BSON?",
      options: ["MySQL", "MongoDB", "Postgres", "Redis"],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Qué comando borra una tabla?",
      options: ["DROP TABLE", "DELETE TABLE", "REMOVE", "DESTROY"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa ACID?",
      options: [
        "Atomicidad, Consistencia, Aislamiento, Durabilidad",
        "Asincronía, Cálculo, Integridad, Datos",
        "Automatización, Control, Indexación, Dominio",
        "Ninguna",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es una transacción en BD?",
      options: [
        "Un conjunto de operaciones que se ejecutan como una sola unidad",
        "Un backup",
        "Una consulta simple",
        "Un índice",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando actualiza datos?",
      options: ["UPDATE", "ALTER", "CHANGE", "MODIFY"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es una clave foránea?",
      options: [
        "Una clave única",
        "Una clave duplicada",
        "Un campo que referencia a otra tabla",
        "Un índice primario",
      ],
      correctAnswer: 2,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa DDL?",
      options: [
        "Data Definition Language",
        "Data Development Logic",
        "Database Dynamic Layer",
        "Data Deletion Language",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa DML?",
      options: [
        "Data Manipulation Language",
        "Database Management Layer",
        "Data Main Logic",
        "Dynamic Memory Level",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué base de datos es orientada a grafos?",
      options: ["Neo4j", "MongoDB", "MySQL", "Redis"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa CRUD?",
      options: [
        "Create, Read, Update, Delete",
        "Copy, Restore, Undo, Drop",
        "Check, Repair, Update, Debug",
        "Compute, Run, Upload, Download",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un índice en BD?",
      options: [
        "Un sistema de seguridad",
        "Una estructura que acelera consultas",
        "Una relación entre tablas",
        "Un tipo de trigger",
      ],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un trigger?",
      options: [
        "Un procedimiento almacenado automático",
        "Un índice duplicado",
        "Una vista",
        "Un backup",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es una vista en SQL?",
      options: [
        "Una tabla virtual basada en una consulta",
        "Un trigger",
        "Un índice",
        "Una relación",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un procedimiento almacenado?",
      options: [
        "Un archivo externo",
        "Un conjunto de instrucciones SQL predefinidas",
        "Un índice",
        "Una vista",
      ],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa OLAP?",
      options: [
        "Online Analytical Processing",
        "Open Logic Application Protocol",
        "Object Layer Analysis Processing",
        "Online Link Application Platform",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa OLTP?",
      options: [
        "Online Transaction Processing",
        "Open Link Transfer Protocol",
        "Object Level Transaction Program",
        "Online Layered Test Processing",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es una base de datos distribuida?",
      options: [
        "Una BD en varios lugares conectados en red",
        "Una BD sin esquema",
        "Una BD en memoria",
        "Una BD solo de lectura",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es replicación en BD?",
      options: [
        "Duplicar datos en distintos servidores",
        "Eliminar redundancia",
        "Normalizar tablas",
        "Usar triggers",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],

  Redes: [
    {
      text: "¿Qué significa IP?",
      options: [
        "Internet Protocol",
        "Internal Program",
        "Internet Port",
        "Integrated Process",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Cuál es la dirección IP local más común?",
      options: ["127.0.0.1", "192.168.0.1", "8.8.8.8", "10.0.0.1"],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Qué puerto usa HTTP por defecto?",
      options: ["21", "25", "80", "443"],
      correctAnswer: 2,
      difficulty: "easy",
    },
    {
      text: "¿Qué puerto usa HTTPS por defecto?",
      options: ["110", "80", "25", "443"],
      correctAnswer: 3,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa DNS?",
      options: [
        "Domain Name System",
        "Data Network Service",
        "Domain Number Server",
        "Digital Node Source",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué capa del modelo OSI corresponde a TCP?",
      options: ["Red", "Transporte", "Aplicación", "Enlace"],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa DHCP?",
      options: [
        "Dynamic Host Configuration Protocol",
        "Domain Host Control Protocol",
        "Data Hyper Control Package",
        "Distributed Host Connection Point",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Cuál es la función principal de un router?",
      options: [
        "Conectar redes distintas",
        "Repetir señales WiFi",
        "Proteger datos",
        "Convertir direcciones IP",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué dirección IP corresponde a loopback?",
      options: ["127.0.0.1", "192.168.1.1", "10.10.10.10", "255.255.255.255"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué protocolo se usa para transferencia segura de archivos?",
      options: ["FTP", "SFTP", "SMTP", "POP3"],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa VPN?",
      options: [
        "Virtual Private Network",
        "Variable Protocol Node",
        "Verified Proxy Network",
        "Virtual Protected Number",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué protocolo se usa para enviar correos?",
      options: ["SMTP", "POP3", "IMAP", "HTTP"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué protocolo se usa para recibir correos?",
      options: ["POP3 o IMAP", "SMTP", "FTP", "SSH"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando sirve para probar conectividad en red?",
      options: ["ping", "ssh", "telnet", "curl"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es una máscara de subred?",
      options: [
        "Un límite para dividir redes",
        "Una IP secundaria",
        "Un firewall",
        "Una dirección privada",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa NAT?",
      options: [
        "Network Address Translation",
        "Node Allocation Table",
        "Network Access Tool",
        "Name Address Transport",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué protocolo reemplazó IPv4?",
      options: ["IPv5", "IPv6", "IPX", "ARP"],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Cuántos bits tiene una dirección IPv4?",
      options: ["16", "32", "64", "128"],
      correctAnswer: 1,
      difficulty: "easy",
    },
    {
      text: "¿Cuántos bits tiene una dirección IPv6?",
      options: ["32", "64", "128", "256"],
      correctAnswer: 2,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa ARP?",
      options: [
        "Address Resolution Protocol",
        "Advanced Routing Process",
        "Automatic Relay Point",
        "Access Routing Protocol",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa MAC en redes?",
      options: [
        "Media Access Control",
        "Main Address Code",
        "Machine Access Channel",
        "Managed Access Control",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué dispositivo se usa para dividir la señal de red sin inteligencia?",
      options: ["Hub", "Switch", "Router", "Bridge"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué dispositivo dirige tráfico dentro de una misma red local?",
      options: ["Hub", "Switch", "Router", "Firewall"],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué capa del modelo OSI corresponde a HTTPS?",
      options: ["Red", "Transporte", "Sesión", "Aplicación"],
      correctAnswer: 3,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa QoS?",
      options: [
        "Quality of Service",
        "Query over Signal",
        "Quick Open Source",
        "Queued Output System",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
  ],

  "Sistemas Operativos": [
    {
      text: "¿Cuál fue el primer sistema operativo de Microsoft?",
      options: ["MS-DOS", "Windows 1.0", "Unix", "Linux"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa SO?",
      options: [
        "Sistema Operativo",
        "Software Original",
        "Sistema Oficial",
        "Servicio Online",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué SO fue creado por Linus Torvalds?",
      options: ["Linux", "Windows", "macOS", "Solaris"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Cuál es el kernel más usado en móviles Android?",
      options: ["Linux", "BSD", "Windows NT", "Darwin"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué sistema operativo utiliza Apple en sus Mac?",
      options: ["macOS", "iOS", "Linux", "Windows"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué comando apaga un sistema Linux?",
      options: ["shutdown", "stop", "halt", "end"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa multitarea?",
      options: [
        "Ejecutar varios procesos a la vez",
        "Usar varios monitores",
        "Usar varias redes",
        "Instalar múltiples SO",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un proceso en un SO?",
      options: [
        "Un programa en ejecución",
        "Un archivo en memoria",
        "Una instrucción de CPU",
        "Una tarea en segundo plano",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un hilo (thread)?",
      options: [
        "Subproceso dentro de un proceso",
        "Un programa completo",
        "Una función de kernel",
        "Un archivo ejecutable",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué SO utiliza el kernel Mach?",
      options: ["macOS", "Linux", "Windows", "Android"],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Cuál es el sistema de archivos usado en Windows?",
      options: ["NTFS", "ext4", "FAT32", "HFS+"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Cuál es el sistema de archivos usado en Linux?",
      options: ["ext4", "NTFS", "APFS", "ZFS"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa BIOS?",
      options: [
        "Basic Input Output System",
        "Binary Integrated Operating System",
        "Base Internal Operating Software",
        "Basic Internet Operation Service",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué reemplazó a la BIOS en sistemas modernos?",
      options: ["UEFI", "EFI", "POST", "GRUB"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué gestor de arranque es común en Linux?",
      options: ["GRUB", "UEFI", "BOOTMGR", "LILO"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando en Linux muestra los procesos en ejecución?",
      options: ["ps", "top", "htop", "ls"],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando en Windows muestra procesos?",
      options: ["tasklist", "dir", "process", "jobs"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué SO es de código abierto?",
      options: ["Linux", "Windows", "macOS", "ChromeOS"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa kernel?",
      options: [
        "Núcleo del sistema operativo",
        "Gestor de archivos",
        "Interfaz gráfica",
        "Controlador de hardware",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué comando sirve para cambiar de directorio en Linux?",
      options: ["cd", "ls", "mv", "pwd"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué comando sirve para listar archivos en Linux?",
      options: ["ls", "dir", "show", "list"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es memoria virtual?",
      options: [
        "Uso del disco duro como RAM",
        "RAM duplicada",
        "Memoria en la nube",
        "Memoria física",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un sistema de archivos?",
      options: [
        "Método de organizar datos en un disco",
        "Software de compresión",
        "Proceso del kernel",
        "Un driver de disco",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un deadlock?",
      options: [
        "Bloqueo entre procesos que esperan recursos",
        "Fallo de memoria",
        "Error de CPU",
        "Fallo de disco",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es un hipervisor?",
      options: [
        "Software que permite virtualización",
        "Sistema de archivos",
        "Kernel de Linux",
        "Driver de red",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
  ],

  "Seguridad Informática": [
    {
      text: "¿Qué significa antivirus?",
      options: [
        "Programa que detecta y elimina malware",
        "Un sistema operativo seguro",
        "Un firewall avanzado",
        "Un sistema de backup",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa malware?",
      options: [
        "Software malicioso",
        "Software rápido",
        "Software legal",
        "Software libre",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un firewall?",
      options: [
        "Un sistema que filtra el tráfico de red",
        "Un tipo de virus",
        "Un protocolo de seguridad",
        "Un antivirus",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa phishing?",
      options: [
        "Robo de información haciéndose pasar por alguien más",
        "Un virus de red",
        "Un ataque físico",
        "Un tipo de firewall",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un ataque de fuerza bruta?",
      options: [
        "Probar todas las combinaciones posibles de contraseñas",
        "Un virus en el sistema",
        "Un ataque DDoS",
        "Un exploit de memoria",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa ransomware?",
      options: [
        "Malware que pide rescate por liberar archivos",
        "Un antivirus corporativo",
        "Un firewall defectuoso",
        "Un exploit de red",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa SSL?",
      options: [
        "Secure Sockets Layer",
        "Software Security License",
        "Secure System Login",
        "Server Security Layer",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué reemplazó al SSL?",
      options: ["TLS", "HTTPS", "IPSec", "AES"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa HTTPS?",
      options: [
        "Protocolo seguro de transferencia de hipertexto",
        "Servidor de seguridad",
        "Un firewall web",
        "Un sistema de login",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un exploit?",
      options: [
        "Un programa que aprovecha vulnerabilidades",
        "Un firewall",
        "Un tipo de backup",
        "Un certificado digital",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa 2FA?",
      options: [
        "Autenticación de dos factores",
        "Seguridad de red",
        "Firewall avanzado",
        "Antivirus actualizado",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un ataque DDoS?",
      options: [
        "Saturar un servidor con múltiples peticiones",
        "Un virus en disco",
        "Un exploit de kernel",
        "Un ataque físico",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa VPN?",
      options: [
        "Virtual Private Network",
        "Verified Protected Node",
        "Virtual Protocol Net",
        "Virus Protection Network",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un keylogger?",
      options: [
        "Un malware que registra teclas",
        "Un sistema de logs",
        "Un antivirus",
        "Un exploit de BIOS",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un certificado digital?",
      options: [
        "Prueba de identidad en comunicaciones seguras",
        "Un firewall de hardware",
        "Un antivirus avanzado",
        "Un exploit de software",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es hashing?",
      options: [
        "Transformar datos en un valor único",
        "Cifrar información",
        "Eliminar datos",
        "Crear backups",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué algoritmo de hashing es muy usado?",
      options: ["SHA-256", "AES", "RSA", "TLS"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa cifrado simétrico?",
      options: [
        "Misma clave para cifrar y descifrar",
        "Claves públicas y privadas",
        "Sin clave",
        "En texto plano",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa cifrado asimétrico?",
      options: [
        "Uso de clave pública y privada",
        "Misma clave en ambos lados",
        "Clave sin cifrar",
        "Un backup de seguridad",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa pentesting?",
      options: [
        "Pruebas de penetración de seguridad",
        "Un firewall de software",
        "Un exploit avanzado",
        "Un antivirus en red",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa rootkit?",
      options: [
        "Malware que se esconde en el sistema",
        "Un exploit de BIOS",
        "Un certificado dañado",
        "Un firewall débil",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa ingeniería social?",
      options: [
        "Manipulación de personas para obtener información",
        "Un exploit de red",
        "Un cifrado débil",
        "Un sistema operativo inseguro",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa sniffing?",
      options: [
        "Intercepción de paquetes en la red",
        "Un ataque físico",
        "Un exploit de memoria",
        "Un backup inseguro",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa brute forcing?",
      options: [
        "Probar todas las combinaciones posibles",
        "Hackeo físico",
        "Cifrado roto",
        "Un malware en BIOS",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa backdoor?",
      options: [
        "Acceso oculto no autorizado al sistema",
        "Un firewall abierto",
        "Un exploit de kernel",
        "Un virus en RAM",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
  ],

  "Inteligencia Artificial": [
    {
      text: "¿Qué significa IA?",
      options: [
        "Inteligencia Artificial",
        "Interfaz Avanzada",
        "Integración Automática",
        "Inteligencia Analítica",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Quién es considerado el padre de la IA?",
      options: [
        "Alan Turing",
        "John McCarthy",
        "Marvin Minsky",
        "Geoffrey Hinton",
      ],
      correctAnswer: 1,
      difficulty: "medium",
    },
    {
      text: "¿Qué es el test de Turing?",
      options: [
        "Una prueba para medir si una máquina puede imitar la inteligencia humana",
        "Un examen de matemáticas",
        "Una técnica de programación",
        "Un lenguaje de IA",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa Machine Learning?",
      options: [
        "Aprendizaje automático",
        "Aprendizaje manual",
        "Aprendizaje lógico",
        "Aprendizaje secuencial",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es Deep Learning?",
      options: [
        "Un subconjunto de Machine Learning basado en redes neuronales profundas",
        "Un algoritmo de búsqueda",
        "Una base de datos de grafos",
        "Un lenguaje de programación",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es una red neuronal artificial?",
      options: [
        "Modelo inspirado en el cerebro humano para procesar datos",
        "Una red de computadoras",
        "Un software de bases de datos",
        "Un compilador",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa NLP en IA?",
      options: [
        "Procesamiento de Lenguaje Natural",
        "Nuevo Lenguaje de Programación",
        "Network Layer Protocol",
        "Numeric Logic Processing",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa Computer Vision?",
      options: [
        "Capacidad de las máquinas de interpretar imágenes",
        "Un lenguaje gráfico",
        "Un sistema operativo",
        "Una base de datos",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un modelo de regresión en Machine Learning?",
      options: [
        "Un algoritmo que predice valores continuos",
        "Un clasificador",
        "Un motor de búsqueda",
        "Un lenguaje de IA",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa Reinforcement Learning?",
      options: [
        "Aprendizaje por recompensas y castigos",
        "Aprendizaje supervisado",
        "Aprendizaje de memoria",
        "Aprendizaje manual",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué algoritmo se usa en árboles de decisión?",
      options: ["ID3 / C4.5", "Bubble Sort", "Dijkstra", "RSA"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un dataset?",
      options: [
        "Conjunto de datos para entrenar modelos",
        "Un lenguaje de programación",
        "Un motor de búsqueda",
        "Un protocolo de red",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa overfitting?",
      options: [
        "Cuando un modelo se ajusta demasiado a los datos de entrenamiento",
        "Cuando el modelo no aprende nada",
        "Cuando se eliminan datos duplicados",
        "Cuando falla la red neuronal",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significa underfitting?",
      options: [
        "Cuando un modelo no aprende patrones relevantes",
        "Cuando el modelo es perfecto",
        "Cuando el dataset es demasiado grande",
        "Cuando se eliminan capas de la red",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es TensorFlow?",
      options: [
        "Framework de IA creado por Google",
        "Un lenguaje de programación",
        "Un procesador",
        "Una base de datos",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es PyTorch?",
      options: [
        "Framework de IA creado por Facebook",
        "Un sistema operativo",
        "Un compilador",
        "Una red social",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un clasificador?",
      options: [
        "Un modelo que asigna categorías a los datos",
        "Un compilador",
        "Un motor de búsqueda",
        "Un framework web",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un perceptrón?",
      options: [
        "Unidad básica de una red neuronal artificial",
        "Un compilador",
        "Un sistema de cifrado",
        "Un servidor",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa clustering?",
      options: [
        "Agrupación de datos similares sin supervisión",
        "Ordenar datos en SQL",
        "Cifrar datos",
        "Eliminar datos duplicados",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es K-Means?",
      options: [
        "Algoritmo de clustering no supervisado",
        "Algoritmo de cifrado",
        "Lenguaje de programación",
        "Framework web",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa Red Convolucional (CNN)?",
      options: [
        "Red neuronal usada para procesar imágenes",
        "Un lenguaje de programación",
        "Una red social",
        "Un compilador",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa Red Recurrente (RNN)?",
      options: [
        "Red neuronal usada para datos secuenciales",
        "Un motor de búsqueda",
        "Un compilador",
        "Un framework de backend",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es el algoritmo Backpropagation?",
      options: [
        "Método para entrenar redes neuronales ajustando pesos",
        "Un lenguaje de programación",
        "Una base de datos",
        "Un compilador",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué es GPT?",
      options: [
        "Modelo de lenguaje basado en transformadores",
        "Un compilador",
        "Un sistema operativo",
        "Un motor gráfico",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa IA débil?",
      options: [
        "IA diseñada para tareas específicas",
        "IA con errores",
        "IA defectuosa",
        "IA que imita emociones",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],

  "Desarrollo Web": [
    {
      text: "¿Qué significa HTML?",
      options: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "HyperTransfer Markup Language",
        "HyperTool Multi Language",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa CSS?",
      options: [
        "Cascading Style Sheets",
        "Creative Style System",
        "Computer Style Sheets",
        "Code Styling Script",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa JavaScript?",
      options: [
        "Lenguaje de programación para web",
        "Lenguaje de marcado",
        "Lenguaje de base de datos",
        "Un framework",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué etiqueta HTML se usa para crear un enlace?",
      options: ["<a>", "<link>", "<href>", "<url>"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa DOM?",
      options: [
        "Document Object Model",
        "Data Object Method",
        "Document Oriented Module",
        "Dynamic Object Mapper",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un framework en desarrollo web?",
      options: [
        "Un conjunto de herramientas y librerías para facilitar el desarrollo",
        "Un lenguaje de programación",
        "Un sistema operativo",
        "Un motor de búsqueda",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa API REST?",
      options: [
        "Interfaz de programación basada en principios REST",
        "Un sistema de almacenamiento",
        "Un framework de diseño",
        "Un tipo de base de datos",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa CRUD?",
      options: [
        "Create, Read, Update, Delete",
        "Code, Run, Update, Deploy",
        "Control, Render, Upload, Debug",
        "Compile, Render, Use, Deploy",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es una SPA (Single Page Application)?",
      options: [
        "Una aplicación web que funciona en una sola página",
        "Una base de datos ligera",
        "Un framework de backend",
        "Un lenguaje de programación",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es Node.js?",
      options: [
        "Un entorno de ejecución de JavaScript en el servidor",
        "Un framework de CSS",
        "Un lenguaje de marcado",
        "Un compilador",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es React?",
      options: [
        "Una librería de JavaScript para construir interfaces",
        "Un framework de backend",
        "Un lenguaje de programación",
        "Un sistema operativo",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es Angular?",
      options: [
        "Un framework de JavaScript mantenido por Google",
        "Un lenguaje de programación",
        "Una librería de CSS",
        "Un compilador",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es Vue.js?",
      options: [
        "Un framework progresivo de JavaScript",
        "Un lenguaje de backend",
        "Un sistema de plantillas HTML",
        "Un motor de bases de datos",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa responsive design?",
      options: [
        "Diseño adaptable a distintos dispositivos",
        "Diseño basado en servidores",
        "Diseño exclusivo para móviles",
        "Diseño con APIs",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa SEO?",
      options: [
        "Search Engine Optimization",
        "System Engine Operation",
        "Server Endpoint Optimization",
        "Site Easy Operation",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un CDN?",
      options: [
        "Content Delivery Network",
        "Code Distribution Node",
        "Content Dynamic Network",
        "Central Data Network",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa HTTP?",
      options: [
        "HyperText Transfer Protocol",
        "High Transfer Text Protocol",
        "Hyper Terminal Transfer Process",
        "HyperTool Transfer Protocol",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa HTTPS?",
      options: [
        "HTTP con seguridad mediante SSL/TLS",
        "Hyper Transfer Total Protocol",
        "HyperText Server Protocol",
        "HighText Secure Process",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es una cookie en desarrollo web?",
      options: [
        "Pequeño archivo que almacena información del usuario en el navegador",
        "Un lenguaje de programación",
        "Un framework de diseño",
        "Un sistema de seguridad",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es localStorage?",
      options: [
        "Una forma de almacenar datos en el navegador",
        "Un framework de frontend",
        "Un tipo de API",
        "Una base de datos",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es un servidor web?",
      options: [
        "Un software que entrega páginas web a los usuarios",
        "Un lenguaje de programación",
        "Una API de base de datos",
        "Un motor de búsqueda",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un backend?",
      options: [
        "La parte de una aplicación que gestiona la lógica y datos en el servidor",
        "La interfaz gráfica del usuario",
        "Un framework de CSS",
        "Una red de internet",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es un frontend?",
      options: [
        "La parte de una aplicación que interactúa con el usuario",
        "La base de datos",
        "El servidor",
        "Un framework de backend",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué es GraphQL?",
      options: [
        "Un lenguaje de consulta para APIs",
        "Un framework de CSS",
        "Un lenguaje de backend",
        "Una librería de frontend",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué es WebSocket?",
      options: [
        "Un protocolo que permite comunicación en tiempo real entre cliente y servidor",
        "Una API de almacenamiento",
        "Un framework de frontend",
        "Una librería de CSS",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],

  "Ingeniería de Software": [
    {
      text: "Un equipo de desarrollo decide documentar cada etapa del ciclo de vida del software antes de continuar a la siguiente. ¿Qué modelo están aplicando?",
      options: [
        "Modelo en Cascada",
        "Modelo en Espiral",
        "Desarrollo Ágil",
        "Prototipado",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "Durante una reunión diaria, cada miembro del equipo responde: ¿Qué hice ayer? ¿Qué haré hoy? ¿Qué obstáculos tengo? ¿A qué metodología pertenece esta práctica?",
      options: ["Scrum", "Kanban", "XP (Extreme Programming)", "Modelo V"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "Si un cliente pide un prototipo rápido para validar una idea, ¿qué enfoque es más adecuado?",
      options: ["Prototipado", "Cascada", "Scrum", "RAD"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Cuál de las siguientes NO es una fase típica del ciclo de vida del software?",
      options: [
        "Diseño",
        "Implementación",
        "Mantenimiento",
        "Minería de datos",
      ],
      correctAnswer: 3,
      difficulty: "easy",
    },
    {
      text: "El principio KISS en ingeniería de software significa:",
      options: [
        "Manténlo simple, estúpido",
        "Keep it safe and secure",
        "Key integration software system",
        "Kernel is super secure",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Un programador repite varias veces el mismo código en distintos módulos. ¿Qué principio está violando?",
      options: ["DRY (Don't Repeat Yourself)", "SOLID", "KISS", "YAGNI"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "El principio YAGNI (You Aren’t Gonna Need It) recomienda:",
      options: [
        "No programar funcionalidades innecesarias",
        "Evitar la documentación",
        "Hacer siempre pruebas unitarias",
        "No usar patrones de diseño",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "Un sistema bancario debe ser extremadamente confiable, pero las especificaciones del cliente pueden cambiar. ¿Qué modelo de desarrollo sería más apropiado?",
      options: [
        "Modelo Espiral",
        "Modelo Cascada",
        "Scrum",
        "Prototipado desechable",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Cuál de los siguientes pertenece a los principios SOLID?",
      options: [
        "Responsabilidad Única",
        "Seguridad de Código",
        "Optimización de Memoria",
        "Gestión de Datos",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "En Scrum, el responsable de eliminar impedimentos para el equipo es:",
      options: [
        "Scrum Master",
        "Product Owner",
        "Stakeholder",
        "Project Manager",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Si un proyecto necesita entregas frecuentes y retroalimentación continua del cliente, ¿qué metodología es más adecuada?",
      options: ["Ágil", "Cascada", "Modelo V", "Prototipado rígido"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué diferencia hay entre verificación y validación en software?",
      options: [
        "Verificación: ¿Se construyó correctamente? Validación: ¿Se construyó lo correcto?",
        "Ambas son lo mismo",
        "Validación es solo pruebas de usuario",
        "Verificación solo aplica al código fuente",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "Un sistema está en producción y se detecta un error crítico. El equipo lo corrige rápidamente sin afectar otras funciones. ¿Qué etapa es esta?",
      options: ["Mantenimiento", "Diseño", "Planificación", "Prototipado"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Si un equipo trabaja con un tablero visual de tareas y limita el número de tareas en progreso, ¿qué metodología está usando?",
      options: ["Kanban", "Scrum", "Modelo en Cascada", "RAD"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Cuál de estas métricas mide la calidad interna del software?",
      options: [
        "Complejidad ciclomática",
        "Satisfacción del cliente",
        "Tiempo de entrega",
        "Velocidad del equipo",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "Un desarrollador aplica el patrón de diseño Singleton. ¿Qué garantiza?",
      options: [
        "Que solo exista una instancia de la clase",
        "Que se pueda heredar fácilmente",
        "Que el código sea más rápido",
        "Que el sistema no tenga errores",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "En la gestión de proyectos de software, ¿qué significa la 'triple restricción'?",
      options: [
        "Tiempo, costo y alcance",
        "Calidad, velocidad y diseño",
        "Usuarios, procesos y datos",
        "Pruebas, mantenimiento y documentación",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué modelo de desarrollo está más orientado a la reducción de riesgos en proyectos grandes?",
      options: ["Modelo Espiral", "Modelo en Cascada", "Scrum", "XP"],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "Si un sistema se prueba comparando los resultados esperados con los reales en cada módulo individual, ¿qué tipo de prueba es?",
      options: [
        "Prueba unitaria",
        "Prueba de integración",
        "Prueba de aceptación",
        "Prueba de sistema",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Un cliente pide ver cómo será la interfaz del software antes de que esté terminado. El equipo crea una versión básica con pantallas navegables. ¿Qué técnica usaron?",
      options: ["Prototipo", "Scrum Sprint", "Modelo en Cascada", "RAD"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "En Extreme Programming (XP), ¿qué práctica promueve que dos desarrolladores trabajen juntos en una misma estación?",
      options: [
        "Programación en pareja",
        "Refactorización",
        "TDD",
        "Scrum Daily",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El Product Owner en Scrum se encarga de:",
      options: [
        "Gestionar y priorizar el backlog del producto",
        "Codificar la aplicación",
        "Eliminar impedimentos",
        "Definir la arquitectura",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "En pruebas de software, cuando el usuario final valida que el producto cumple con sus necesidades, se trata de:",
      options: [
        "Prueba de aceptación",
        "Prueba unitaria",
        "Prueba de integración",
        "Prueba de carga",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Un equipo reestructura el código para hacerlo más limpio y entendible sin cambiar su comportamiento. ¿Qué práctica está aplicando?",
      options: [
        "Refactorización",
        "Reingeniería",
        "Mantenimiento",
        "Prototipado",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "Cuando una organización reutiliza componentes de software ya probados para reducir costos y riesgos, aplica:",
      options: [
        "Ingeniería basada en componentes",
        "Desarrollo en cascada",
        "Scrum",
        "Patrones de código",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],

  Hardware: [
    {
      text: "¿Qué componente es la 'cerebro' de la computadora?",
      options: ["CPU", "GPU", "RAM", "ROM"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué memoria pierde los datos al apagar el equipo?",
      options: ["RAM", "ROM", "Flash", "SSD"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Cuál de estos no es un dispositivo de entrada?",
      options: ["Teclado", "Ratón", "Monitor", "Micrófono"],
      correctAnswer: 2,
      difficulty: "easy",
    },
    {
      text: "¿Qué tipo de memoria es más rápida?",
      options: ["Cache", "RAM", "SSD", "HDD"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "La unidad SSD se diferencia del HDD en que:",
      options: [
        "No tiene partes mecánicas",
        "Es más lento",
        "Tiene más ruido",
        "Consume más energía",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué significa GPU?",
      options: [
        "Graphics Processing Unit",
        "General Purpose Unit",
        "Global Processing Utility",
        "Gaming Power Unit",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Un bus de datos sirve para:",
      options: [
        "Transferir información",
        "Almacenar datos",
        "Mostrar imágenes",
        "Procesar instrucciones",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué mide la velocidad de un procesador?",
      options: ["GHz", "GB", "FPS", "MB/s"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "La memoria ROM se usa para:",
      options: [
        "Almacenar firmware",
        "Guardar programas temporales",
        "Procesar gráficos",
        "Expandir RAM",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué componente se encarga de alimentar la PC?",
      options: ["Fuente de poder", "CPU", "Placa madre", "GPU"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "La BIOS se guarda en:",
      options: ["ROM", "RAM", "SSD", "Cache"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Cuál conector se usa en pantallas modernas?",
      options: ["HDMI", "VGA", "PS/2", "RJ45"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significa RAID?",
      options: [
        "Redundant Array of Independent Disks",
        "Random Access Integrated Device",
        "Reliable Automatic Input Data",
        "Rapid Array of Integrated Devices",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué tipo de memoria es DDR4?",
      options: ["RAM", "ROM", "Cache", "Flash"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué parte conecta todos los componentes?",
      options: ["Placa madre", "CPU", "GPU", "RAM"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "La refrigeración líquida se usa para:",
      options: [
        "Reducir temperatura",
        "Aumentar memoria",
        "Mejorar gráficos",
        "Guardar energía",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué puerto se usa para redes cableadas?",
      options: ["RJ45", "USB", "HDMI", "VGA"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué mide el benchmark en hardware?",
      options: ["Rendimiento", "Capacidad", "Consumo eléctrico", "Precio"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué componente es volátil?",
      options: ["RAM", "ROM", "SSD", "HDD"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El overclocking aumenta:",
      options: [
        "Velocidad del procesador",
        "Tamaño de la RAM",
        "Almacenamiento",
        "Duración del disco",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué memoria es más cercana a la CPU?",
      options: ["Cache", "RAM", "ROM", "Flash"],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "El puerto Thunderbolt es conocido por:",
      options: [
        "Alta velocidad de transferencia",
        "Conexión a internet",
        "Procesar gráficos",
        "Cargar batería",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué componente guarda datos a largo plazo?",
      options: ["Disco duro", "RAM", "Cache", "GPU"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "Un sistema de 64 bits puede manejar más:",
      options: ["Memoria", "Resolución", "Velocidad de reloj", "Núcleos"],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué unidad mide el consumo de energía en hardware?",
      options: ["Watt", "Volt", "Ampere", "Ohm"],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],

  "Historia de la Computación": [
    {
      text: "¿Quién es considerado el padre de la computación?",
      options: [
        "Charles Babbage",
        "Alan Turing",
        "John von Neumann",
        "Bill Gates",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿En qué año apareció la primera computadora electrónica ENIAC?",
      options: ["1946", "1939", "1955", "1960"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "La máquina de Turing fue una idea de:",
      options: [
        "Alan Turing",
        "Ada Lovelace",
        "Claude Shannon",
        "Charles Babbage",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Quién escribió el primer algoritmo?",
      options: ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Blaise Pascal"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué empresa lanzó el primer microprocesador (Intel 4004)?",
      options: ["Intel", "IBM", "Microsoft", "Apple"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "La arquitectura de Von Neumann se basa en:",
      options: [
        "Almacenar programas en memoria",
        "Usar tarjetas perforadas",
        "Separar datos y código físicamente",
        "Procesar en paralelo",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué eran las tarjetas perforadas?",
      options: [
        "Medio de entrada",
        "Sistema de memoria",
        "Tipo de procesador",
        "Pantalla primitiva",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El lenguaje COBOL fue impulsado por:",
      options: [
        "Grace Hopper",
        "Ada Lovelace",
        "John Backus",
        "Tim Berners-Lee",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué inventó Tim Berners-Lee?",
      options: ["World Wide Web", "UNIX", "TCP/IP", "C++"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El sistema operativo UNIX surgió en:",
      options: ["1969", "1955", "1975", "1983"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué computadora usaba válvulas de vacío?",
      options: ["ENIAC", "Altair 8800", "Apple I", "Cray-1"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "El Altair 8800 fue importante porque:",
      options: [
        "Popularizó la PC",
        "Usaba transistores",
        "Tenía pantalla gráfica",
        "Fue el primer laptop",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué empresa creó la primera PC comercial de gran éxito?",
      options: ["IBM", "Apple", "Microsoft", "HP"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué significan las siglas ARPANET?",
      options: [
        "Advanced Research Projects Agency Network",
        "Automatic Research Program for Allied Nations",
        "Advanced Random Processing Architecture Net",
        "Applied Research Protocol and Network",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿En qué década nacieron las minicomputadoras?",
      options: ["1960s", "1940s", "1980s", "2000s"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué inventó John von Neumann?",
      options: [
        "Modelo de arquitectura",
        "Lenguaje Fortran",
        "Primer transistor",
        "Internet",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "La primera computadora Apple se llamó:",
      options: ["Apple I", "Macintosh", "Apple II", "Lisa"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El término 'bug' en programación lo popularizó:",
      options: ["Grace Hopper", "Alan Turing", "Bill Gates", "Steve Jobs"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Cuál fue el primer lenguaje de alto nivel?",
      options: ["Fortran", "COBOL", "C", "Pascal"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "¿Qué invento reemplazó las válvulas de vacío?",
      options: ["Transistor", "Microchip", "Circuito integrado", "Condensador"],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El Cray-1 fue un ejemplo de:",
      options: [
        "Supercomputadora",
        "Minicomputadora",
        "PC doméstica",
        "Mainframe",
      ],
      correctAnswer: 0,
      difficulty: "hard",
    },
    {
      text: "¿Qué significan las siglas DNS?",
      options: [
        "Domain Name System",
        "Digital Network Server",
        "Data Node Service",
        "Dynamic Net Source",
      ],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "El ratón de computadora fue inventado por:",
      options: ["Douglas Engelbart", "Steve Jobs", "Xerox PARC", "Bill Gates"],
      correctAnswer: 0,
      difficulty: "medium",
    },
    {
      text: "¿Qué característica introdujo el Macintosh en 1984?",
      options: [
        "Interfaz gráfica",
        "Procesador de 64 bits",
        "Pantalla táctil",
        "Memoria flash",
      ],
      correctAnswer: 0,
      difficulty: "easy",
    },
    {
      text: "El lenguaje C fue creado en:",
      options: ["1972", "1960", "1980", "1991"],
      correctAnswer: 0,
      difficulty: "medium",
    },
  ],
};

// 📌 Generar código aleatorio de trivia
function generarCodigoTrivia() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp"
    );
    console.log("✅ Conectado a MongoDB");

    await User.deleteMany();
    await Trivia.deleteMany();
    await Question.deleteMany();

    const usuarios = [
      {
        name: "Sthefany Angeles",
        email: "admin@gmail.com",
        password: "123456",
        role: "admin",
        isVerified: true,
      },
    ];

    const usuariosCreados = await User.insertMany(usuarios);

    // 50 trivias con dificultades específicas
    let trivias = [];
    const dificultades = ["easy", "medium", "hard"];

    for (let i = 0; i < 50; i++) {
      const categoria = categorias[i % categorias.length];
      const creador =
        usuariosCreados[Math.floor(Math.random() * usuariosCreados.length)];
      const preguntasCategoria = preguntasPorCategoria[categoria];

      // Validar que la categoría tenga preguntas definidas
      if (!preguntasCategoria || preguntasCategoria.length === 0) {
        console.warn(
          `⚠️ Saltando categoría "${categoria}" - no tiene preguntas definidas`
        );
        continue;
      }

      // Asignar dificultad aleatoria a la trivia
      const dificultadTrivia =
        dificultades[Math.floor(Math.random() * dificultades.length)];

      // Filtrar preguntas por dificultad de la trivia
      let preguntasPorDificultad = preguntasCategoria.filter(
        (p) => p.difficulty === dificultadTrivia
      );

      // Si no hay suficientes preguntas de esa dificultad, usar todas las preguntas
      if (preguntasPorDificultad.length < 5) {
        preguntasPorDificultad = preguntasCategoria;
      }

      const preguntasSeleccionadas = preguntasPorDificultad
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      // Determinar el nombre de la dificultad para el título
      const nombreDificultad =
        dificultadTrivia === "easy"
          ? "Fácil"
          : dificultadTrivia === "medium"
          ? "Intermedio"
          : "Avanzado";

      const trivia = new Trivia({
        title: `${categoria} ${nombreDificultad} #${i + 1}`,
        description: `Trivia de nivel ${nombreDificultad.toLowerCase()} sobre ${categoria}. ¡Pon a prueba tus conocimientos!`,
        code: generarCodigoTrivia(),
        difficulty: dificultadTrivia,
        createdBy: creador._id,
        isActive: true,
      });

      await trivia.save();

      let preguntasIds = [];
      for (let p of preguntasSeleccionadas) {
        // 🎲 Mezclar las opciones para variar la posición de la respuesta correcta
        const preguntaMezclada = mezclarOpciones(p);

        const pregunta = new Question({
          text: preguntaMezclada.text,
          options: preguntaMezclada.options,
          correctAnswer: preguntaMezclada.correctAnswer,
          category: categoria,
          difficulty: preguntaMezclada.difficulty,
          trivia: trivia._id,
        });
        await pregunta.save();
        preguntasIds.push(pregunta._id);
      }

      trivia.questions = preguntasIds;
      await trivia.save();
      trivias.push(trivia);
    }

    console.log(`🎯 ${trivias.length} trivias creadas`);
    const totalPreguntas = await Question.countDocuments();
    console.log(`📊 Total de preguntas creadas: ${totalPreguntas}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seed();
