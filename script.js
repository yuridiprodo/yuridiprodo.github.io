const articlesDiv = document.getElementById('articles');

// Funzione per caricare e visualizzare gli articoli
async function loadArticle(articleName) {
    const response = await fetch(`articles/${articleName}`);
    const markdown = await response.text();
    const html = marked(markdown);
    
    // Mostra il contenuto dell'articolo
    document.body.innerHTML = html;
}

// Funzione per recuperare la lista degli articoli
async function fetchArticles() {
    const response = await fetch('https://api.github.com/repos/yuridiprodo/yuridiprodo.github.io/contents/articles');
    const articles = await response.json();

    // Crea i link agli articoli
    for (const article of articles) {
        const response = await fetch(article.download_url);
        const markdown = await response.text();

        // Estrai l'h1 dal Markdown
        const titleMatch = markdown.match(/# (.+)/);
        const title = titleMatch ? titleMatch[1] : article.name.replace('.md', '');

        const link = document.createElement('a');
        link.href = `articles/${article.name}`;
        link.innerText = title;

        const titleElement = document.createElement('h1');
        titleElement.appendChild(link);

        // Aggiungi l'evento click per caricare l'articolo
        link.addEventListener('click', (event) => {
            event.preventDefault();
            loadArticle(article.name);
        });

        articlesDiv.appendChild(titleElement);
    }
}

// Carica la lista degli articoli all'avvio
fetchArticles();
