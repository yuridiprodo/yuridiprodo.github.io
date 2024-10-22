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

            // Ordina gli articoli in base alla data (assumendo che il nome del file sia nel formato YYYY-MM-DD)
            articles.sort((a, b) => {
                const dateA = new Date(a.split('/').pop().split('-').slice(0, 3).join('-'));
                const dateB = new Date(b.split('/').pop().split('-').slice(0, 3).join('-'));
                return dateA - dateB; // Ordinamento crescente
            });

            // Salva gli articoli e carica il primo articolo di default
            window.articles = articles;
            loadArticle(articles[0]); // Carica il primo articolo (il più vecchio)
        }
    });
}

// Funzione per caricare un articolo specifico
function loadArticle(article) {
    const articleName = article.split('/').pop().replace('.md', '.html');

    // Aggiorna l'URL per il permalink
    history.pushState(null, '', articleName);

    // Carica il contenuto dell'articolo
    $.get(article, function (data) {
        $('#content').html(data);
        updateNavigation(articleName);
    });
}

// Funzione per aggiornare i pulsanti di navigazione
function updateNavigation(currentArticle) {
    const currentIndex = window.articles.findIndex(article => article.includes(currentArticle.replace('.html', '.md')));

    // Trova l'articolo precedente e successivo
    const prevArticle = window.articles[currentIndex - 1] || null; // Articolo meno recente
    const nextArticle = window.articles[currentIndex + 1] || null; // Articolo più recente

    // Mostra i link per navigare
    let navHtml = '<hr>';
    if (prevArticle) {
        navHtml += `<a href="#" onclick="loadArticle('${prevArticle}'); return false;">Articolo precedente</a>`;
    }
    if (nextArticle) {
        navHtml += ` | <a href="#" onclick="loadArticle('${nextArticle}'); return false;">Articolo successivo</a>`;
    }
    $('#content').append(navHtml);
}

// Carica gli articoli all'apertura della pagina
$(document).ready(loadArticles);
