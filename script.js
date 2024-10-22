// Funzione per caricare gli articoli
function loadArticles() {
    // Fai la richiesta per ottenere la lista degli articoli
    $.ajax({
        url: 'articles/', // Percorso della cartella con gli articoli
        success: function (data) {
            // Estrai i link degli articoli e ordina per data
            let articles = $(data).find('a[href$=".md"]').map(function () {
                return this.href;
            }).get();

            // Ordina gli articoli in base alla data
            articles.sort((a, b) => {
                const dateA = new Date(a.split('/').pop().split('-').slice(0, 3).join('-'));
                const dateB = new Date(b.split('/').pop().split('-').slice(0, 3).join('-'));
                return dateB - dateA; // Ordinamento decrescente per ottenere i più recenti in alto
            });

            // Mostra l'elenco degli articoli
            displayArticles(articles);
        }
    });
}

// Funzione per visualizzare l'elenco degli articoli
function displayArticles(articles) {
    let articlesHtml = '<h2>Articoli</h2><ul>';
    articles.forEach(article => {
        const articleName = article.split('/').pop().replace('.md', '.html');
        articlesHtml += `<li><a href="#" onclick="loadArticle('${article}'); return false;">${articleName}</a></li>`;
    });
    articlesHtml += '</ul>';
    $('#articles-list').html(articlesHtml);
}

// Funzione per caricare un articolo specifico
function loadArticle(article) {
    $.get(article, function (data) {
        $('#content').html(marked(data)); // Converte il Markdown in HTML
        updateNavigation(article);
    });
}

// Funzione per aggiornare i pulsanti di navigazione
function updateNavigation(currentArticle) {
    // Codice per aggiornare la navigazione (precedente/successivo)
}

// Carica gli articoli all'apertura della pagina
$(document).ready(loadArticles);
