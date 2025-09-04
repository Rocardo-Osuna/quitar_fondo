const dropArea = document.querySelector('.drop-area')
const texto = dropArea.querySelector('.texto')
const texto2 = dropArea.querySelector('.texto2')
const boton = dropArea.querySelector('button')
const input = dropArea.querySelector('#input-file')
const preview = document.querySelector('.preview')
//const prueba = document.querySelector('.prueba')
const dtodo = document.getElementById('d-todo')
const loader = document.getElementById('loader')
let proceso = false //bandera para no agregar mas imagnes
let files = []
let nuevos_files = []




boton.addEventListener('click', (e) => {
    input.click();
});


dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    if(proceso)
        return;
    texto.textContent = "Suelta aqui"
    dropArea.classList.add('active')
});

dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if(proceso)
        return;
    dropArea.classList.remove('active')
    texto.textContent = 'Arrastra aqui'
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    if(proceso)
        return;
    //files = Array.from(e.dataTransfer.files); este sobreescribe todo
    //files = files.concat(Array.from(e.dataTransfer.files));

    dropArea.classList.add('active')
    const nuevos = Array.from(e.dataTransfer.files); 
    files = files.concat(nuevos);
    nuevos_files = nuevos_files.concat(nuevos);
    loader.hidden = false
    texto.textContent = ''
    texto2.textContent = ''
    boton.disabled = true
    proceso = true
    enviarImagenes()
});

input.addEventListener('change', (e) => {
    //files = Array.from(e.target.files) sobreescribe al agregar mas
    //files = files.concat(Array.from(e.target.files));

    dropArea.classList.add('active')
    const nuevos = Array.from(e.target.files)
    files = files.concat(nuevos)
    nuevos_files = nuevos_files.concat(nuevos)
    loader.hidden = false
    texto.textContent = ''
    texto2.textContent = ''
    boton.disabled = true
    proceso = true

    enviarImagenes()
    //setTimeout(() => dropArea.classList.remove('active'), 750)
});

preview.addEventListener('click', (e) =>{
    if (e.target && e.target.matches(".btn-eliminar")) {
        const wrapper = e.target.closest(".img-wrapper"); 
        const img = wrapper.querySelector("img");         

        wrapper.remove();
        files = files.filter(f => f.name !== img.alt);
        if (!files.length) {
            dtodo.hidden = true;
        }

        console.log("Eliminar ->", img.alt);

    }

    if(e.target && e.target.matches('.btn-descargar')){
        const wrapper = e.target.closest('.img-wrapper')
        const img = wrapper.querySelector('img')

        console.log('Descargar -->', img.alt)
        const link = document.createElement('a');
        link.href = img.src;                // img.src es data:image/png;base64,...
        link.download = img.alt || 'imagen.png';
        link.click();
    }

});

dtodo.addEventListener('click', (e) =>{
    descargar_todo()
});

function mostrarfiles(files) {
    for (const file of files) {
        console.log(file.name)
        //processFile(file)
    }
    console.log(files.length)
    files.forEach(file => processFile(file));

};

function processFile(file) {
    const docType = file.type
    const validExtensions = ['image/jpg', 'image/jpeg', 'image/png'];

    if (validExtensions.includes(docType)) {
        const fileReader = new FileReader();
        //const randomName = `file-${Math.random().toString(32).substring(7)}`;
        const id = `id-${Math.random().toString(36).substring(2, 9)}`;
        fileReader.addEventListener('load', () => {
            const fileurl = fileReader.result
            const image = `
                    <div class="img-wrapper">
                        <img id='${file.name}' src="${fileurl}">
                        <button class="btn-primary btn-eliminar">X</button>
                        <button class="btn btn-primary btn-descargar">Descargar</button>
                    </div>
            `

            const html = document.querySelector('.preview').innerHTML
            document.querySelector('.preview').innerHTML = image + html
        });
        fileReader.readAsDataURL(file)
    } else {
        console.log(`Archivo ${file.name} de tipo ${docType} no es válido`);
    }
};



async function enviarImagenes() {
    try {
        const formData = new FormData();
        nuevos_files.forEach((file) => {
            formData.append('imagenes', file);
        });

        const respuesta = await fetch('/quitar_fondo/', {
            method: 'POST',
            body: formData
        });
        const resultado = await respuesta.json();
        console.log('Respuesta:: ', resultado);

        resultado.resultados.forEach((r) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("img-wrapper");

            const img = document.createElement("img");
            img.classList.add("img-thumbnail");
            img.src = r.imagen;
            img.alt = r.nombre;

            const boton_cerrar = document.createElement('button')
            boton_cerrar.classList.add('btn-eliminar')
            boton_cerrar.textContent = 'X'

            const boton_descargar = document.createElement('button')
            boton_descargar.classList.add('btn')
            boton_descargar.classList.add('btn-primary')
            boton_descargar.classList.add('btn-descargar')    
            boton_descargar.textContent = 'Descargar' 

            wrapper.appendChild(img);
            wrapper.appendChild(boton_cerrar);
            wrapper.appendChild(boton_descargar);

            document.querySelector(".preview").appendChild(wrapper);
        });

        nuevos_files= []
        dtodo.hidden = false
        loader.hidden = true
        texto.textContent = 'Arrastra aqui'
        texto2.textContent = 'O'
        boton.disabled = false
        dropArea.classList.remove('active')
        proceso = false
    } catch (error) {
        console.error("Error:: ", error);
    }
}

function descargar_todo() {
    const wrappers = document.querySelectorAll('.preview .img-wrapper');
    
    wrappers.forEach((wrapper, index) => {
        const img = wrapper.querySelector('img');
        
        const link = document.createElement('a');
        link.href = img.src;
        link.download = img.alt || `imagen-${index + 1}.png`;
        link.click();
        link.remove();
    });
}

/**
prueba.addEventListener('click', () =>{
    for(const f of files){
        console.log(f.name)
    }
    console.log(files.length)

});
*/