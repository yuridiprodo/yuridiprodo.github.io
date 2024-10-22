// Funzione per caricare gli articoli
function loadArticles() {
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
    const currentIndex = window.articles.findIndex(article => article.includes(currentArticle.replace('.html', '.md')));

    // Trova l'articolo precedente e successivo
    const prevArticle = window.articles[currentIndex + 1] || null; // Articolo meno recente
    const nextArticle = window.articles[currentIndex - 1] || null; // Articolo più recente

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
$(document).ready(function() {
    loadArticle('home.md'); // Carica home.md all'avvio
    loadArticles(); // Carica l'elenco degli articoli
});
