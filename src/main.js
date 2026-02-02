// main.js

document.addEventListener('DOMContentLoaded', function() {
  // Variables globales
  let quizzesData = [];
  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedSubject = '';

  // Elementos del DOM
  const startMenu = document.getElementById('startMenu');
  const questionSection = document.getElementById('questionSection');
  const resultsSection = document.getElementById('resultsSection');
  
  const subjectName = document.getElementById('subjectName');
  const subjectIcon = document.getElementById('subjectIcon');
  const subjectIconContainer = subjectIcon.parentElement; // El div contenedor del icono
  
  // Elemento del texto "Pick a subject to get started"
  const pickSubjectText = document.querySelector('.text-blue-300.text-sm.mb-10');
  
  const subjectButtons = {
    html: document.getElementById('htmlSubject'),
    css: document.getElementById('cssSubject'),
    js: document.getElementById('jsSubject'),
    accessibility: document.getElementById('accessibilitySubject')
  };
  
  const questionHeading = document.getElementById('questionHeading');
  const currentQuestionElement = document.getElementById('currentQuestion');
  const quizProgress = document.getElementById('quizProgress');
  const quizForm = document.getElementById('quizForm');
  const submitButton = quizForm.querySelector('button[type="submit"]');
  
  const answerOptions = {
    A: document.querySelector('#optionA + div + span'),
    B: document.querySelector('#optionB + div + span'),
    C: document.querySelector('#optionC + div + span'),
    D: document.querySelector('#optionD + div + span')
  };
  
  const radioButtons = {
    A: document.getElementById('optionA'),
    B: document.getElementById('optionB'),
    C: document.getElementById('optionC'),
    D: document.getElementById('optionD')
  };
  
  const finalScore = document.getElementById('finalScore');
  const playAgainButton = document.getElementById('playAgain');
  
  // Elementos del results section
  const resultSubjectIcon = document.getElementById('resultSubjectIcon');
  const resultSubjectName = document.getElementById('resultSubjectName');
  
  // Elementos del toggle
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const themeToggle = document.getElementById('themeToggle');

  // Variable para almacenar los colores originales de los botones
  let originalButtonColors = {};

  // Inicializar la aplicación
  async function initApp() {
    try {
      // Cargar datos del JSON
      const response = await fetch('./data.json');
      quizzesData = await response.json();
      
      // Guardar los colores originales de los botones
      saveOriginalButtonColors();
      
      // Configurar event listeners
      setupEventListeners();
      
      // Inicializar tema desde localStorage o preferencias del sistema
      initializeTheme();
      
      // Ocultar secciones no necesarias al inicio
      questionSection.style.display = 'none';
      resultsSection.style.display = 'none';
      
    } catch (error) {
      console.error('Error cargando los datos:', error);
    }
  }

  // Guardar los colores originales de los botones
  function saveOriginalButtonColors() {
    Object.entries(subjectButtons).forEach(([subject, button]) => {
      if (button) {
        // Guardar las clases originales del botón
        originalButtonColors[subject] = Array.from(button.classList);
      }
    });
  }

  // Restaurar los colores originales de los botones
  function restoreOriginalButtonColors() {
    Object.entries(subjectButtons).forEach(([subject, button]) => {
      if (button && originalButtonColors[subject]) {
        // Primero, remover todas las clases de color
        const colorClasses = [
          'bg-white',
          'bg-orange-50', 'bg-orange-100',
          'bg-green-50', 'bg-green-100',
          'bg-blue-50', 'bg-blue-100',
          'bg-purple-50', 'bg-purple-100'
        ];
        
        colorClasses.forEach(cls => button.classList.remove(cls));
        
        // Agregar transición suave
        button.classList.add('transition-all', 'duration-200');
        
        // Restaurar las clases originales
        originalButtonColors[subject].forEach(cls => {
          // Solo agregar clases que no sean de transición (para evitar duplicados)
          if (!cls.includes('transition')) {
            button.classList.add(cls);
          }
        });
      }
    });
  }

  // Configurar todos los event listeners
  function setupEventListeners() {
    // Botones de subjects
    subjectButtons.html.addEventListener('click', () => selectSubject('html'));
    subjectButtons.css.addEventListener('click', () => selectSubject('css'));
    subjectButtons.js.addEventListener('click', () => selectSubject('javascript'));
    subjectButtons.accessibility.addEventListener('click', () => selectSubject('accessibility'));

    // Formulario de respuestas
    quizForm.addEventListener('submit', handleAnswerSubmit);
    
    // Radio buttons para habilitar el botón de submit
    radioButtons.A.addEventListener('change', () => { submitButton.disabled = false; });
    radioButtons.B.addEventListener('change', () => { submitButton.disabled = false; });
    radioButtons.C.addEventListener('change', () => { submitButton.disabled = false; });
    radioButtons.D.addEventListener('change', () => { submitButton.disabled = false; });
    
    // Botón play again
    playAgainButton.addEventListener('click', resetQuiz);
    
    // Toggle del tema
    if (themeToggle) {
      themeToggle.addEventListener('change', toggleTheme);
    }
  }

  // Seleccionar un subject
  function selectSubject(subject) {
    selectedSubject = subject;
    currentQuiz = quizzesData.quizzes.find(q => q.title.toLowerCase() === subject);
    
    if (!currentQuiz) return;
    
    // Actualizar el header con el subject seleccionado
    updateHeaderSubject();
    
    // Resetear variables del quiz
    currentQuestionIndex = 0;
    score = 0;
    
    // Cambiar a la sección de preguntas
    startMenu.style.display = 'none';
    questionSection.style.display = 'flex';
    resultsSection.style.display = 'none';
    
    // Cargar la primera pregunta
    loadQuestion();
  }

  // Actualizar el header con el subject seleccionado
  function updateHeaderSubject() {
    if (!currentQuiz) return;
    
    // Actualizar el nombre del subject
    subjectName.textContent = currentQuiz.title;
    
    // Actualizar el icono del subject
    subjectIcon.src = currentQuiz.icon;
    subjectIcon.alt = `${currentQuiz.title} icon`;
    
    // Limpiar clases anteriores
    const colorClasses = ['bg-orange-50', 'bg-green-100', 'bg-blue-50', 'bg-purple-100'];
    const sizeClasses = ['size-[28.57px]', 'size-10', 'md:size-10']; // Clases de tamaño según tu HTML
    
    colorClasses.forEach(cls => subjectIconContainer.classList.remove(cls));
    sizeClasses.forEach(cls => subjectIcon.classList.remove(cls));
    
    // Añadir las clases correspondientes
    const subject = currentQuiz.title.toLowerCase();
    
    // Configurar color de fondo (mismo que en el menú)
    switch(subject) {
      case 'html':
        subjectIconContainer.classList.add('bg-orange-50');
        break;
      case 'css':
        subjectIconContainer.classList.add('bg-green-100');
        break;
      case 'javascript':
        subjectIconContainer.classList.add('bg-blue-50');
        break;
      case 'accessibility':
        subjectIconContainer.classList.add('bg-purple-100');
        break;
    }
    
    // Configurar tamaño del icono (mismo que en el menú)
    subjectIcon.classList.add('size-[28.57px]', 'md:size-10');
  }

  // Cargar una pregunta
  function loadQuestion() {
    if (!currentQuiz || !currentQuiz.questions[currentQuestionIndex]) return;
    
    const question = currentQuiz.questions[currentQuestionIndex];
    
    // Actualizar el número de pregunta
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    
    // Actualizar la pregunta
    questionHeading.textContent = question.question;
    
    // Actualizar las opciones de respuesta
    const letters = ['A', 'B', 'C', 'D'];
    letters.forEach(letter => {
      if (answerOptions[letter] && question.options[letters.indexOf(letter)]) {
        answerOptions[letter].textContent = question.options[letters.indexOf(letter)];
      }
    });
    
    // Resetear los radio buttons
    radioButtons.A.checked = false;
    radioButtons.B.checked = false;
    radioButtons.C.checked = false;
    radioButtons.D.checked = false;
    
    // Deshabilitar el botón de submit
    submitButton.disabled = true;
    
    // Actualizar la barra de progreso
    const progressValue = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;
    quizProgress.value = progressValue;
  }

  // Manejar el envío de respuesta
  function handleAnswerSubmit(e) {
    e.preventDefault();
    
    // Encontrar la respuesta seleccionada
    let selectedRadio = null;
    let selectedValue = null;
    
    if (radioButtons.A.checked) {
      selectedRadio = radioButtons.A;
      selectedValue = 'A';
    } else if (radioButtons.B.checked) {
      selectedRadio = radioButtons.B;
      selectedValue = 'B';
    } else if (radioButtons.C.checked) {
      selectedRadio = radioButtons.C;
      selectedValue = 'C';
    } else if (radioButtons.D.checked) {
      selectedRadio = radioButtons.D;
      selectedValue = 'D';
    }
    
    if (!selectedRadio) return;
    
    const selectedIndex = ['A', 'B', 'C', 'D'].indexOf(selectedValue);
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    
    // Verificar si la respuesta es correcta
    if (currentQuestion.options[selectedIndex] === currentQuestion.answer) {
      score++;
    }
    
    // Pasar a la siguiente pregunta o mostrar resultados
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuiz.questions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }

  // Mostrar resultados
  function showResults() {
    // Actualizar el resultado final
    finalScore.textContent = score;
    
    // Actualizar el subject en los resultados
    if (resultSubjectIcon && resultSubjectName) {
      resultSubjectIcon.src = currentQuiz.icon;
      resultSubjectIcon.alt = `${currentQuiz.title} icon`;
      resultSubjectName.textContent = currentQuiz.title;
      
      // Aplicar color y tamaño al icono en resultados
      const resultsIconContainer = resultSubjectIcon.parentElement.querySelector('div');
      if (resultsIconContainer) {
        const colorClasses = ['bg-orange-50', 'bg-green-100', 'bg-blue-50', 'bg-purple-100'];
        colorClasses.forEach(cls => resultsIconContainer.classList.remove(cls));
        
        const subject = currentQuiz.title.toLowerCase();
        switch(subject) {
          case 'html':
            resultsIconContainer.classList.add('bg-orange-50');
            break;
          case 'css':
            resultsIconContainer.classList.add('bg-green-100');
            break;
          case 'javascript':
            resultsIconContainer.classList.add('bg-blue-50');
            break;
          case 'accessibility':
            resultsIconContainer.classList.add('bg-purple-100');
            break;
        }
        
        // Aplicar tamaño al icono en resultados
        const sizeClasses = ['size-[28.57px]', 'md:size-10'];
        sizeClasses.forEach(cls => resultSubjectIcon.classList.remove(cls));
        resultSubjectIcon.classList.add('size-[28.57px]', 'md:size-10');
      }
    }
    
    // Cambiar a la sección de resultados
    questionSection.style.display = 'none';
    resultsSection.style.display = 'flex';
  }

  // Resetear el quiz
  function resetQuiz() {
    // Resetear variables
    currentQuestionIndex = 0;
    score = 0;
    selectedSubject = '';
    currentQuiz = null;
    
    // Limpiar el header
    subjectName.textContent = '';
    subjectIcon.src = '';
    subjectIcon.alt = '';
    
    // Limpiar clases del header
    const colorClasses = ['bg-orange-50', 'bg-green-100', 'bg-blue-50', 'bg-purple-100'];
    const sizeClasses = ['size-[28.57px]', 'size-10', 'md:size-10'];
    
    colorClasses.forEach(cls => subjectIconContainer.classList.remove(cls));
    sizeClasses.forEach(cls => subjectIcon.classList.remove(cls));
    
    // Limpiar results section
    if (resultSubjectIcon && resultSubjectName) {
      resultSubjectIcon.src = '';
      resultSubjectIcon.alt = '';
      resultSubjectName.textContent = '';
      
      const resultsIconContainer = resultSubjectIcon.parentElement.querySelector('div');
      if (resultsIconContainer) {
        colorClasses.forEach(cls => resultsIconContainer.classList.remove(cls));
      }
      
      sizeClasses.forEach(cls => resultSubjectIcon.classList.remove(cls));
    }
    
    // Mostrar el menú de inicio
    startMenu.style.display = 'flex';
    questionSection.style.display = 'none';
    resultsSection.style.display = 'none';
  }

  // Función para actualizar colores de botones según tema
  function updateSubjectButtonsForTheme(isLightTheme) {
    if (isLightTheme) {
      // Modo claro: fondo blanco para todos los botones
      Object.values(subjectButtons).forEach(button => {
        if (button) {
          // Remover todos los colores de fondo posibles
          const allBgClasses = [
            'bg-white',
            'bg-orange-50', 'bg-orange-100',
            'bg-green-50', 'bg-green-100',
            'bg-blue-50', 'bg-blue-100',
            'bg-purple-50', 'bg-purple-100'
          ];
          
          const allHoverClasses = [
            'hover:bg-orange-100',
            'hover:bg-green-100', 
            'hover:bg-blue-100',
            'hover:bg-purple-100'
          ];
          
          // Remover todas las clases
          allBgClasses.forEach(cls => button.classList.remove(cls));
          allHoverClasses.forEach(cls => button.classList.remove(cls));
          
          // Agregar fondo blanco
          button.classList.add('bg-white');
          
          // Agregar transición suave si no está presente
          if (!button.classList.contains('transition-all')) {
            button.classList.add('transition-all', 'duration-200');
          }
        }
      });
    } else {
      // Modo oscuro: restaurar los colores originales
      restoreOriginalButtonColors();
    }
  }

  // Actualizar el color del texto "Pick a subject to get started"
  function updatePickSubjectTextColor(isLightTheme) {
    if (pickSubjectText) {
      if (isLightTheme) {
        // Modo claro: texto azul oscuro
        pickSubjectText.classList.remove('text-blue-300');
        pickSubjectText.classList.add('text-blue-900');
      } else {
        // Modo oscuro: texto azul claro
        pickSubjectText.classList.remove('text-blue-900');
        pickSubjectText.classList.add('text-blue-300');
      }
    }
  }

  // Obtener tema guardado o preferencia del sistema
  function getSavedTheme() {
    const savedTheme = localStorage.getItem('quizTheme');
    
    if (savedTheme) {
      return savedTheme; // 'light' o 'dark'
    }
    
    // Si no hay tema guardado, usar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // Guardar tema en localStorage
  function saveTheme(theme) {
    localStorage.setItem('quizTheme', theme);
  }

  // Aplicar tema (modo claro u oscuro)
  function applyTheme(isLightTheme) {
    const body = document.body;
    const toggleCircle = document.querySelector('.toggleContainer span');
    const mainElement = document.querySelector('main.startMenu');
    
    if (isLightTheme) {
      // Aplicar modo claro
      body.classList.remove('bg-blue-900', 'text-white', 'text-blue-300');
      body.classList.add('bg-gray-100', 'text-blue-900');
      
      // Cambiar patrón de fondo
      if (mainElement) {
        mainElement.classList.remove('bg-pattern');
        mainElement.classList.add('bg-pattern-light');
      }

      // Cambiar iconos a versión DARK (en modo claro, iconos oscuros)
      if (sunIcon && moonIcon) {
        sunIcon.src = 'assets/images/icon-sun-dark.svg';
        moonIcon.src = 'assets/images/icon-moon-dark.svg';
      }

      // Mover el círculo a la IZQUIERDA
      if (toggleCircle) {
        toggleCircle.classList.remove('translate-x-3', 'md:translate-x-5');
        toggleCircle.classList.add('translate-x-0');
      }
      
      // Actualizar colores de botones para modo claro (fondo blanco)
      updateSubjectButtonsForTheme(true);
      
      // Actualizar color del texto para modo claro
      updatePickSubjectTextColor(true);
      
      // Actualizar el checkbox
      if (themeToggle) {
        themeToggle.checked = true;
      }
      
    } else {
      // Aplicar modo oscuro
      body.classList.remove('bg-gray-100', 'text-blue-900');
      body.classList.add('bg-blue-900', 'text-white');
      
      // Cambiar patrón de fondo
      if (mainElement) {
        mainElement.classList.remove('bg-pattern-light');
        mainElement.classList.add('bg-pattern');
      }

      // Cambiar iconos a versión LIGHT (en modo oscuro, iconos claros)
      if (sunIcon && moonIcon) {
        sunIcon.src = 'assets/images/icon-sun-light.svg';
        moonIcon.src = 'assets/images/icon-moon-light.svg';
      }

      // Mover el círculo a la DERECHA
      if (toggleCircle) {
        toggleCircle.classList.remove('translate-x-0');
        toggleCircle.classList.add('translate-x-3', 'md:translate-x-5');
      }
      
      // Actualizar colores de botones para modo oscuro (restaurar colores originales)
      updateSubjectButtonsForTheme(false);
      
      // Actualizar color del texto para modo oscuro
      updatePickSubjectTextColor(false);
      
      // Actualizar el checkbox
      if (themeToggle) {
        themeToggle.checked = false;
      }
    }
  }

  // Inicializar tema
  function initializeTheme() {
    // Obtener tema guardado o preferencia del sistema
    const savedTheme = getSavedTheme();
    const isLightTheme = savedTheme === 'light';
    
    // Aplicar el tema
    applyTheme(isLightTheme);
  }

  // Cambiar tema claro/oscuro
  function toggleTheme(e) {
    const isChecked = e.target.checked; 
    const isLightTheme = isChecked;
    
    // Aplicar el tema visualmente
    applyTheme(isLightTheme);
    
    // Guardar la preferencia en localStorage
    saveTheme(isLightTheme ? 'light' : 'dark');
  }

  // Iniciar la aplicación
  initApp();
});