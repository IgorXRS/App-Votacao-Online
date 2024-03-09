
var firebaseConfig = {
    apiKey: "AIzaSyAqPwFy79JT3G96UJkxzdI9M4LUyPk65PA",
    authDomain: "votacao-5b623.firebaseapp.com",
    projectId: "votacao-5b623",
    storageBucket: "votacao-5b623.appspot.com",
    messagingSenderId: "562128983006",
    appId: "1:562128983006:web:6334742a4e14333755c34f",
    measurementId: "G-BC02KZ5PWM"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


const storage = firebase.storage();
const db = firebase.firestore();



document.addEventListener('DOMContentLoaded', async function() {

    
    const container = document.querySelector('.container');
    const candidatos = document.querySelectorAll('.candidato');
    localStorage.clear();

    function ativarCandidato(candidato) {
    // Definição da função ativarCandidato
    candidatos.forEach((c) => c.classList.remove('ativado'));
    candidato.classList.add('ativado');
    const opcaoVoto = candidato.getAttribute('data-opcao'); // Obtém a opção do voto do atributo data-opcao
    console.log(opcaoVoto)
    // Armazena a opção de voto no Local Storage
    localStorage.setItem('opcaoVoto', opcaoVoto);
    }

    candidatos.forEach((candidato) => {
    candidato.querySelector('button').addEventListener('click', () => {
        ativarCandidato(candidato);
    });
    });

    // Carrega os IDs de dispositivos existentes do Firebase
    const db = firebase.firestore();

    const enviarVotobtn = document.querySelector('.enviarVoto');
    enviarVotobtn.addEventListener('click', async (e)=>{
        e.preventDefault();

        document.getElementById("loadingOverlay").style.display = "block";

        
    // Obtém o Device ID do dispositivo
    const deviceId = await getDeviceId();
    alert(deviceId);

    // Verifica se o Device ID já existe no banco de dados
    const nomeVotacaoSelecionado = document.getElementById('selectPesquisas').value;
    const votosSnapshot = await db.collection('votacao').doc(nomeVotacaoSelecionado).collection('votos').doc(deviceId).get();
    if (votosSnapshot.exists) {
        
        document.getElementById("loadingOverlay").style.display = "none";
        alert('Você já votou neste dispositivo!');
        mostrarResultados();
        localStorage.clear();
        candidatos.forEach((c) => c.classList.remove('ativado'));
        return;
    }

        const opcaoVoto = localStorage.getItem('opcaoVoto');

        

        if(opcaoVoto != null){

            const nomeVotacaoSelecionado = document.getElementById('selectPesquisas').value; // Obtém o nome da votação selecionada

            if (!nomeVotacaoSelecionado) {
                alert('Selecione uma votação antes de votar!');
                return;
            }
            const deviceId = await getDeviceId();
            // Envia o voto para o Firebase
            db.collection('votacao').doc(nomeVotacaoSelecionado).collection('votos').doc(deviceId).set({
                opcao: opcaoVoto,
                horario: firebase.firestore.FieldValue.serverTimestamp(),
                deviceId: deviceId,
            }).then(() => {
                console.log('Voto enviado com sucesso para a votação: ' + nomeVotacaoSelecionado);
            }).catch((error) => {
                document.getElementById("loadingOverlay").style.display = "none";
                console.error("Erro ao enviar o voto para o Firestore: " + error.message);
                alert('Erro ao enviar o voto. Por favor, tente novamente mais tarde.');
            });
            handleChangeResultado();  
            document.getElementById("loadingOverlay").style.display = "none";
            mostrarResultados();
        } else {
            alert('Escolha seu candidato!');
        }
        localStorage.clear();
        candidatos.forEach((c) => c.classList.remove('ativado'));
    });

    //-----------------------------------------------------------------------------------------------------
    async function buscarNomesPesquisas() {
        try {
            const snapshot = await db.collection('pesquisas').get();
            const nomesPesquisas = [];
            snapshot.forEach((doc) => {
                nomesPesquisas.push(doc.id);
            });
            
            console.log('Nomes das pesquisas:', nomesPesquisas); // Adicionando console.log
            return nomesPesquisas;
            
        } catch (error) {
            console.error('Erro ao buscar nomes de pesquisas:', error);
            return [];
        }
    }

    // Chamando a função para buscar os nomes das pesquisas
    const nomesPesquisas = await buscarNomesPesquisas();
    
    // Seletor do elemento <select>
    const selectPesquisas = document.getElementById('selectPesquisas');

    // Limpar opções existentes, caso existam
    selectPesquisas.innerHTML = '<option value="">Selecione uma votação</option>';

    // Adicionar cada nome de pesquisa como uma opção no select
    nomesPesquisas.forEach(nomePesquisa => {
        const option = document.createElement('option');
        option.value = nomePesquisa;
        option.textContent = nomePesquisa;
        selectPesquisas.appendChild(option);
    });

    const btnPesquisas = document.getElementById('btnPesquisas');
    // Adicionar o event listener para o evento de mudança
    btnPesquisas.addEventListener('click', handleChangeEvent);


    //-----------------------------------------------------------------------------------------------------

    const nomeVotacaoNaURL = obterNomeVotacaoDaURL();
    if (nomeVotacaoNaURL) {
        await preencherVotacaoNaPagina(nomeVotacaoNaURL);
    }

    //-----------------------------------------------------------------------------------------------------
// Seletor do formulário de cadastro de votação
const formVotacao = document.querySelector('#form-votacao');

// Seletor do botão para adicionar candidato
const btnAdicionarCandidato = document.querySelector('#adicionarCandidato');

// Event listener para o botão de adicionar candidato
btnAdicionarCandidato.addEventListener('click', (event) => {
    event.preventDefault();
    
    // Obter valores dos campos do candidato
    const nomeCandidato = document.querySelector('#nomeCandidato').value;
    const foto1URL = document.querySelector('#foto1Candidato').files[0];
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!nomeCandidato || !foto1URL) {
        alert('Por favor, preencha todos os campos obrigatórios do candidato.');
        return;
    }

    // Criar novo elemento para o candidato
    const novoCandidato = document.createElement('li');
    novoCandidato.innerHTML = `
        <span>${nomeCandidato}</span>
        <img src="${URL.createObjectURL(foto1URL)}" alt="Foto 1">
    `;
    
    // Adicionar o novo candidato à lista de candidatos
    document.querySelector('#listaCandidatos').appendChild(novoCandidato);
    
    // Limpar campos do formulário de adicionar candidato
    document.querySelector('#nomeCandidato').value = '';
    document.querySelector('#foto1Candidato').value = '';
});

// Event listener para o envio do formulário de cadastro de votação
formVotacao.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    document.getElementById("loadingOverlay").style.display = "block";
    
    // Obter valores dos campos
    const nomeVotacao = document.querySelector('#nomeVotacao').value;
    const descricaoVotacao = document.querySelector('#descricaoVotacao').value;
    const autorVotacao = document.querySelector('#autorVotacao').value;
    //const dataInicioVotacao = document.querySelector('#dataInicioVotacao').value;
    //const dataFimVotacao = document.querySelector('#dataFimVotacao').value;

    document.getElementById('selectPesquisas2').value = "";
    document.getElementById('selectPesquisas2').value = nomeVotacao;
    console.log(nomeVotacao);
    
    // Obter candidatos da lista
    const candidatos = [];
    document.querySelectorAll('#listaCandidatos li').forEach((candidatoElement) => {
        const nome = candidatoElement.querySelector('span').textContent;
        const foto1File = candidatoElement.querySelector('img:nth-child(2)').src;
        candidatos.push({ nome, foto1File });
    });

    // Salvar as fotos no Firebase Storage e obter as URLs
    const fotosURLs = await Promise.all(candidatos.map(async (candidato) => {
        const foto1Ref = storage.ref().child(`candidates/${nomeVotacao}/${candidato.nome}_foto1`);

        try {
            // Obter os blobs das imagens
            const foto1Blob = await fetch(candidato.foto1File).then(response => response.blob());

            // Salvar as imagens no Firebase Storage
            await foto1Ref.put(foto1Blob);

            // Obter as URLs das imagens
            const foto1URL = await foto1Ref.getDownloadURL();

            return { foto1URL };
        } catch (error) {
            console.error('Erro ao salvar ou obter URL da imagem:', error);
            return null; // Ou qualquer tratamento de erro desejado
        }
    }));

    // Salvar os dados no Firestore com URLs das fotos
    try {
        await db.collection('pesquisas').doc(nomeVotacao).set({
            nomeVotacao,
            //dataInicioVotacao,
            //dataFimVotacao,
            descricaoVotacao,
            autorVotacao,
            candidatos: candidatos.map((candidato, index) => ({
                nome: candidato.nome,
                foto1URL: fotosURLs[index]?.foto1URL || '' // Verifica se a URL está presente
            })),
            dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
        });
        

        // Limpar campos do formulário após salvar os dados
        document.querySelector('#nomeVotacao').value = '';
        document.querySelector('#descricaoVotacao').value = '';
        document.querySelector('#autorVotacao').value = '';
        //document.querySelector('#dataFimVotacao').value = '';
        //document.querySelector('#dataInicioVotacao').value = '';
        document.querySelector('#listaCandidatos').innerHTML = '';

        document.getElementById('cadastroVotacao').classList.add('hidden');
        document.getElementById('sectionVotacao').classList.add('hidden');
        document.getElementById('resultadosVotacao').classList.add('hidden');
        document.getElementById('cadastroCriado').classList.remove('hidden');
        
        document.getElementById("loadingOverlay").style.display = "none";
        alert('Votação cadastrada com sucesso!');
    } catch (error) {
        document.getElementById("loadingOverlay").style.display = "none";
        console.error('Erro ao salvar votação no Firestore:', error);
        alert('Erro ao salvar votação. Por favor, tente novamente mais tarde.');
    }
});

});

async function getDeviceId() {
    try {
        // Use uma solicitação síncrona para obter o endereço IP do usuário
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip; // Obtenha o endereço IP do usuário

        // Concatenar o endereço IP com a string "user"
        const hash = 'user' + ip;


        return hash;
    } catch (error) {
        console.error('Erro ao obter o endereço IP:', error);
        return null;
    }
};

// Função para extrair o valor do parâmetro 'votacao' da URL
function obterNomeVotacaoDaURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('votacao');
}

// Função para preencher o seletor de votação com base no parâmetro 'votacao' da URL
async function preencherVotacaoNaPagina(nomeVotacao) {
    try {
        // Seletor do elemento <select>
        const selectPesquisas = document.getElementById('selectPesquisas');
        
        // Selecionar automaticamente a votação na página
        selectPesquisas.value = nomeVotacao;

        // Chamar a função de mudança de evento manualmente
        handleChangeEvent();
        handleChangeResultado();
    } catch (error) {
        console.error('Erro ao preencher a votação na página:', error);
    }
}

// Função para lidar com o evento de mudança no seletor de pesquisas
async function handleChangeEvent(event) {
    const nomeVotacaoSelecionado = document.getElementById('selectPesquisas').value;
    console.log(nomeVotacaoSelecionado);

    // Limpar a lista de candidatos antes de carregar novos candidatos
    const container = document.querySelector('.container');
    container.innerHTML = '';

    try {
        // Carregar os candidatos do documento selecionado na coleção "pesquisas" no Firebase Firestore
        const doc = await db.collection('pesquisas').doc(nomeVotacaoSelecionado).get();
        
        if (doc.exists) {
            const candidatos = doc.data().candidatos;

            const titulo = doc.data().nomeVotacao;
            const descricao = doc.data().descricaoVotacao;
            
            // Atualizar o título e a descrição na seção de votação
            document.querySelector('.title h1').textContent = titulo;
            document.querySelector('.title p').textContent = descricao;

            // Criar contêineres de candidato dinamicamente
            candidatos.forEach((candidato) => {
                const divCandidato = document.createElement('div');
                divCandidato.classList.add('candidato');
                divCandidato.dataset.opcao = candidato.nome; // Definir o nome do candidato como opção

                const img = document.createElement('img');
                img.src = candidato.foto1URL; // Definir a foto 1 do candidato

                const h2 = document.createElement('h2');
                h2.textContent = candidato.nome; // Nome do candidato

                const button = document.createElement('button');
                button.textContent = 'Selecionar';

                // Adicionar evento de clique ao botão
                button.addEventListener('click', () => {
                    ativarCandidato(divCandidato);
                });

                divCandidato.appendChild(img);
                divCandidato.appendChild(h2);
                divCandidato.appendChild(button);

                container.appendChild(divCandidato);
            });
        } else {
            console.error('Nenhum documento encontrado com o ID selecionado:', nomeVotacaoSelecionado);
        }
    } catch (error) {
        console.error('Erro ao carregar candidatos:', error);
    }
}


// Função para ativar o candidato e exibir a imagem correspondente
function ativarCandidato(candidato) {
    const candidatos = document.querySelectorAll('.candidato');
    // Definição da função ativarCandidato
    candidatos.forEach((c) => c.classList.remove('ativado'));
    candidato.classList.add('ativado');
    const opcaoVoto = candidato.getAttribute('data-opcao'); // Obtém a opção do voto do atributo data-opcao
    console.log(opcaoVoto)
    // Armazena a opção de voto no Local Storage
    localStorage.setItem('opcaoVoto', opcaoVoto);
}



//-----------------------------------------------------------------------------------------------------

async function handleChangeResultado() {
    const votacaoSelecionada = document.getElementById('selectPesquisas').value; // Obtém o nome da votação selecionada

    if (votacaoSelecionada) {
        // Obter os votos da coleção selecionada
        const votosSnapshot = await db.collection('votacao').doc(votacaoSelecionada).collection('votos').get();

        // Mapear os votos para contar quantos cada candidato recebeu
        const contagemVotos = {};
        votosSnapshot.forEach((voto) => {
            const opcao = voto.data().opcao;
            contagemVotos[opcao] = (contagemVotos[opcao] || 0) + 1;
        });

        const maxVotos = Math.max(...Object.values(contagemVotos));

        // Selecionar a div onde os resultados serão exibidos
        const resultadosParciaisDiv = document.querySelector('.resultadosParciais');

        // Limpar o conteúdo atual dos resultados parciais
        resultadosParciaisDiv.innerHTML = '';

        // Adicionar o cabeçalho dos resultados parciais
        const header = document.createElement('h2');
        header.textContent = 'RESULTADO PARCIAL';
        resultadosParciaisDiv.appendChild(header);

        //const votacaoInicio = '08/03/2024'; // Data de início da votação (substitua pela sua data real)
        //const votacaoFim = '15/03/2024'; // Data de término da votação (substitua pela sua data real)

        //const votacaoInicioP = document.createElement('p');
        //votacaoInicioP.textContent = 'Votação iniciada em ' + votacaoInicio + ', finalizar em ' + votacaoFim + '.';
        //resultadosParciaisDiv.appendChild(votacaoInicioP);

        // Adicionar os resultados de cada candidato
        for (const [candidato, votos] of Object.entries(contagemVotos)) {

            const divCandidatoResultado = document.createElement('div');
            divCandidatoResultado.classList.add('candidatoResultado');
            const pVotosCandidato = document.createElement('p');
            pVotosCandidato.textContent = votos;
            const larguraBarra = (votos / maxVotos) * 120; // 120px é a largura máxima
            const barra = document.createElement('div');
            barra.classList.add('barra');
            barra.style.width = larguraBarra + 'px'; // Largura da barra proporcional ao número de votos

         
            const pNomeCandidato2 = document.createElement('h4');
            pNomeCandidato2.textContent = candidato;

            const imgCandidato = document.createElement('img');
            const doc = await db.collection('pesquisas').doc(votacaoSelecionada).get();
            const candidatos = doc.data().candidatos;
            const candidatoObj = candidatos.find(c => c.nome === candidato);
            imgCandidato.src = candidatoObj.foto1URL; // Substitua pelo caminho real da imagem do candidato
            imgCandidato.alt = 'Foto do candidato';

        
            divCandidatoResultado.appendChild(pVotosCandidato);
            divCandidatoResultado.appendChild(barra);
            divCandidatoResultado.appendChild(pNomeCandidato2);
            divCandidatoResultado.appendChild(imgCandidato); // Adiciona a imagem do candidato após a barra
            resultadosParciaisDiv.appendChild(divCandidatoResultado);
        }
    } else {
        alert('Selecione uma votação antes de ver os resultados!');
    }

}

function mostrarResultados() {
    document.getElementById('cadastroVotacao').classList.add('hidden');
    document.getElementById('sectionVotacao').classList.add('hidden');
    document.getElementById('resultadosVotacao').classList.remove('hidden');
    document.getElementById('cadastroCriado').classList.add('hidden');
}


// ---- http://127.0.0.1:5500/index.html?votacao=Meninas --------------------------------