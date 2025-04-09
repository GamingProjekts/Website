document.addEventListener("DOMContentLoaded", () => {
    console.log("Website geladen!");

    // Links für Logout und Account löschen
    const logoutLink = document.getElementById("logout-link");
    const deleteAccountLink = document.getElementById("delete-account-link");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
        // Benutzer ist eingeloggt, Links anzeigen
        logoutLink.classList.remove("hidden");
        deleteAccountLink.classList.remove("hidden");
    }

    // Logout-Logik
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            alert("Du wurdest ausgeloggt!");
            window.location.href = "index.html";
        });
    }

    // Account löschen-Logik
    const deleteAccountButton = document.getElementById("delete-account-button");
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", () => {
            if (confirm("Möchtest du deinen Account wirklich löschen?")) {
                const users = JSON.parse(localStorage.getItem("users") || "{}");
                delete users[loggedInUser];
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.removeItem("loggedInUser");
                alert("Dein Account wurde gelöscht!");
                window.location.href = "index.html";
            }
        });
    }

    // Hilfsfunktion: Passwort-Hashing
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    const { registerUser, verifyUser } = require('./userDataHandler');

    // Benutzerregistrierung
    const registerButton = document.getElementById("register-button");
    const registerUsername = document.getElementById("register-username");
    const registerPassword = document.getElementById("register-password");
    const registerSuccess = document.getElementById("register-success");

    if (registerButton) {
        registerButton.addEventListener("click", async () => {
            const username = registerUsername.value.trim();
            const password = registerPassword.value.trim();

            if (username && password) {
                try {
                    const response = await fetch('/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    if (response.ok) {
                        registerSuccess.style.display = "block";
                        registerUsername.value = "";
                        registerPassword.value = "";
                    } else {
                        const error = await response.json();
                        alert(error.message);
                    }
                } catch (error) {
                    alert("Fehler bei der Registrierung: " + error.message);
                }
            } else {
                alert("Bitte fülle alle Felder aus!");
            }
        });
    }

    // Benutzer-Login
    const loginButton = document.getElementById("login-button");
    const loginUsername = document.getElementById("login-username");
    const loginPassword = document.getElementById("login-password");
    const loginError = document.getElementById("login-error");

    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const username = loginUsername.value.trim();
            const password = loginPassword.value.trim();

            if (username && password) {
                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    if (response.ok) {
                        localStorage.setItem("loggedInUser", username);
                        window.location.href = "index.html"; // Weiterleitung zur Startseite
                    } else {
                        loginError.style.display = "block";
                    }
                } catch (error) {
                    alert("Fehler beim Login: " + error.message);
                }
            } else {
                alert("Bitte fülle alle Felder aus!");
            }
        });
    }

    // Abstimmungsseite: Überprüfen, ob der Benutzer eingeloggt ist
    const voteQuestion = document.getElementById("vote-question");
    const answersContainerVote = document.getElementById("answers-container");
    const voteForm = document.getElementById("vote-form");
    const voteResult = document.getElementById("vote-result");

    if (voteQuestion && answersContainerVote && voteForm && voteResult) {
        const loggedInUser = localStorage.getItem("loggedInUser");
        const users = JSON.parse(localStorage.getItem("users") || "{}");

        if (!loggedInUser || !users[loggedInUser]) {
            alert("Bitte logge dich ein, um abzustimmen!");
            window.location.href = "auth.html";
        } else if (users[loggedInUser].hasVoted) {
            alert("Du hast bereits abgestimmt!");
            window.location.href = "index.html";
        } else {
            const question = localStorage.getItem("voteQuestion");
            const answers = JSON.parse(localStorage.getItem("voteAnswers") || "[]");

            if (question && answers.length > 0) {
                voteQuestion.textContent = question;
                answers.forEach(answer => {
                    const label = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.value = answer;
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(answer));
                    answersContainerVote.appendChild(label);
                    answersContainerVote.appendChild(document.createElement("br"));
                });
            }

            voteForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const selectedAnswers = Array.from(answersContainerVote.querySelectorAll("input:checked"))
                    .map(input => input.value);

                if (selectedAnswers.length > 0) {
                    const results = JSON.parse(localStorage.getItem("voteResults") || "{}");
                    selectedAnswers.forEach(answer => {
                        results[answer] = (results[answer] || 0) + 1;
                    });
                    localStorage.setItem("voteResults", JSON.stringify(results));

                    // Markiere den Benutzer als abgestimmt
                    users[loggedInUser].hasVoted = true;
                    localStorage.setItem("users", JSON.stringify(users));

                    voteResult.style.display = "block";
                    voteForm.style.display = "none";
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2000);
                }
            });
        }
    }

    // Admin Login
    const adminLoginButton = document.getElementById("admin-login-button");
    const adminPassword = document.getElementById("admin-password");
    const adminLoginError = document.getElementById("admin-login-error");
    const adminPanel = document.getElementById("admin-panel");
    const backToHomeButton = document.getElementById("back-to-home");
    const pageManagement = document.getElementById("page-management");

    if (adminLoginButton) {
        adminLoginButton.addEventListener("click", () => {
            if (adminPassword.value === "2q") {
                adminLoginError.style.display = "none";
                adminPanel.style.display = "block";
                pageManagement.style.display = "block";
            } else {
                adminLoginError.style.display = "block";
            }
        });
    }

    if (backToHomeButton) {
        backToHomeButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // Abstimmung speichern
    const saveVoteButton = document.getElementById("save-vote");
    const voteQuestionInput = document.getElementById("vote-question");
    const answersContainer = document.getElementById("answers-container");
    const addAnswerButton = document.getElementById("add-answer");
    const voteDurationInput = document.getElementById("vote-duration");
    const saveSuccess = document.getElementById("save-success");

    if (addAnswerButton) {
        addAnswerButton.addEventListener("click", () => {
            const newAnswerInput = document.createElement("input");
            newAnswerInput.type = "text";
            newAnswerInput.className = "answer-input";
            newAnswerInput.placeholder = "Antwort eingeben";
            answersContainer.appendChild(newAnswerInput);
        });
    }

    if (saveVoteButton) {
        saveVoteButton.addEventListener("click", () => {
            const question = voteQuestionInput.value;
            const answers = Array.from(document.querySelectorAll(".answer-input"))
                .map(input => input.value)
                .filter(value => value.trim() !== "");
            const duration = parseInt(voteDurationInput.value, 10);

            if (question && answers.length > 0 && duration > 0) {
                const expirationTime = Date.now() + duration * 60 * 1000; // Dauer in Millisekunden
                localStorage.setItem("voteQuestion", question);
                localStorage.setItem("voteAnswers", JSON.stringify(answers));
                localStorage.setItem("voteExpiration", expirationTime.toString());
                saveSuccess.style.display = "block";
            }
        });
    }

    // Abstimmung löschen
    const deleteVoteButton = document.getElementById("delete-vote");
    const deleteSuccess = document.getElementById("delete-success");

    if (deleteVoteButton) {
        deleteVoteButton.addEventListener("click", () => {
            localStorage.removeItem("voteQuestion");
            localStorage.removeItem("voteAnswers");
            localStorage.removeItem("voteResults");
            localStorage.removeItem("voteExpiration");
            deleteSuccess.style.display = "block";
        });
    }

    // Aktuelle Abstimmung auf der Startseite anzeigen
    const currentVoteQuestion = document.getElementById("current-vote-question");
    const currentVoteAnswers = document.getElementById("current-vote-answers");
    const currentVoteResults = document.getElementById("current-vote-results");

    if (currentVoteQuestion && currentVoteAnswers && currentVoteResults) {
        const question = localStorage.getItem("voteQuestion");
        const answers = JSON.parse(localStorage.getItem("voteAnswers") || "[]");
        const results = JSON.parse(localStorage.getItem("voteResults") || "{}");
        const expiration = parseInt(localStorage.getItem("voteExpiration"), 10);
        const finalResults = JSON.parse(localStorage.getItem("finalResults") || "{}");

        if (finalResults.question) {
            currentVoteQuestion.textContent = `Abgeschlossene Abstimmung: ${finalResults.question}`;
            Object.entries(finalResults.results).forEach(([answer, count]) => {
                const resultItem = document.createElement("li");
                resultItem.textContent = `${answer}: ${count} Stimmen`;
                currentVoteResults.appendChild(resultItem);
            });
        } else if (Date.now() > expiration) {
            localStorage.removeItem("voteQuestion");
            localStorage.removeItem("voteAnswers");
            localStorage.removeItem("voteResults");
            localStorage.removeItem("voteExpiration");
            currentVoteQuestion.textContent = "Keine aktive Abstimmung";
        } else if (question && answers.length > 0) {
            currentVoteQuestion.textContent = question;
            answers.forEach(answer => {
                const listItem = document.createElement("li");
                listItem.textContent = answer;
                currentVoteAnswers.appendChild(listItem);

                const resultItem = document.createElement("li");
                resultItem.textContent = `${answer}: ${results[answer] || 0} Stimmen`;
                currentVoteResults.appendChild(resultItem);
            });
        } else {
            currentVoteQuestion.textContent = "Keine aktive Abstimmung";
        }
    }

    // Referenzen zu den Buttons und Eingabefeldern
    const pageList = document.getElementById("page-list");
    const createPageButton = document.getElementById("create-page-button");
    const pageNameInput = document.getElementById("page-name");
    const pageContentInput = document.getElementById("page-content");
    const pageVisibilitySelect = document.getElementById("page-visibility");
    const editPageButton = document.getElementById("edit-page-button");
    const deletePageButton = document.getElementById("delete-page-button");
    const savePageButton = document.getElementById("save-page-button");
    const cancelEditButton = document.getElementById("cancel-edit-button");
    const pagePreview = document.getElementById("page-preview");
    const editPageVisibilitySelect = document.getElementById("edit-page-visibility");
    const closeModalButton = document.getElementById("close-modal");
    const pagePreviewIframe = document.getElementById("page-preview-iframe");
    const pageEditContainer = document.getElementById("page-edit-container");
    const editPageModal = document.getElementById("edit-page-modal");
    const addSectionButton = document.getElementById("add-section-button");
    const addMenuItemButton = document.getElementById("add-menu-item-button");

    let currentPageIndex = null;

    // Lade bestehende Seiten
    function loadPages() {
        const pages = JSON.parse(localStorage.getItem("pages") || "[]");

        // Füge die Startseite als feste Seite hinzu
        const allPages = [
            { name: "index.html", content: document.documentElement.outerHTML, visibility: "all" },
            ...pages
        ];

        pageList.innerHTML = ""; // Liste leeren
        allPages.forEach((page, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <input type="radio" name="selected-page" value="${index}">
                <span>${page.name} (${page.visibility === "loggedIn" ? "Nur für eingeloggte Benutzer" : "Für alle"})</span>
            `;
            pageList.appendChild(li);
        });
    }

    // Seite erstellen
    createPageButton.addEventListener("click", () => {
        const name = pageNameInput.value.trim();
        const content = pageContentInput.value.trim();
        const visibility = pageVisibilitySelect.value;

        if (name && content) {
            const pages = JSON.parse(localStorage.getItem("pages") || "[]");
            pages.push({ name, content, visibility });
            localStorage.setItem("pages", JSON.stringify(pages));
            alert("Seite wurde erstellt!");
            loadPages(); // Aktualisiere die Liste
            pageNameInput.value = "";
            pageContentInput.value = "";
        } else {
            alert("Bitte fülle alle Felder aus!");
        }
    });

    // Seite bearbeiten
    editPageButton.addEventListener("click", () => {
        const selectedPage = document.querySelector('input[name="selected-page"]:checked');
        if (selectedPage) {
            const pages = JSON.parse(localStorage.getItem("pages") || "[]");
            const allPages = [
                { name: "index.html", content: document.documentElement.outerHTML, visibility: "all" },
                ...pages
            ];
            currentPageIndex = parseInt(selectedPage.value, 10);
            const page = allPages[currentPageIndex];

            // Erstelle eine neue Seite für die Bearbeitung
            const editorWindow = window.open("", "_blank");
            editorWindow.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bearbeiten: ${page.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 1rem; }
                        header, footer { background-color: #1e1e1e; color: white; padding: 1rem; text-align: center; }
                        iframe { width: 100%; height: 80vh; border: 1px solid #ccc; margin-top: 1rem; }
                        button { margin-top: 1rem; padding: 0.5rem 1rem; background-color: #4caf50; color: white; border: none; cursor: pointer; }
                        button:hover { background-color: #45a049; }
                    </style>
                </head>
                <body>
                    <header>
                        <h1>Bearbeiten: ${page.name}</h1>
                    </header>
                    <main>
                        <iframe id="editor-frame"></iframe>
                        <button id="save-button">Änderungen speichern</button>
                        <button id="cancel-button">Bearbeitung abbrechen</button>
                    </main>
                    <script>
                        const saveButton = document.getElementById("save-button");
                        const cancelButton = document.getElementById("cancel-button");
                        const editorFrame = document.getElementById("editor-frame");

                        // Lade den Inhalt in das iframe
                        editorFrame.contentDocument.open();
                        editorFrame.contentDocument.write(\`${page.content}\`);
                        editorFrame.contentDocument.close();

                        // Mache den iframe-Inhalt bearbeitbar
                        editorFrame.contentDocument.designMode = "on";

                        // Änderungen speichern
                        saveButton.addEventListener("click", () => {
                            const updatedContent = editorFrame.contentDocument.documentElement.outerHTML;
                            window.opener.postMessage({ index: ${currentPageIndex}, content: updatedContent }, "*");
                            alert("Änderungen gespeichert!");
                            window.close();
                        });

                        // Bearbeitung abbrechen
                        cancelButton.addEventListener("click", () => {
                            if (confirm("Möchtest du die Bearbeitung wirklich abbrechen?")) {
                                window.close();
                            }
                        });
                    </script>
                </body>
                </html>
            `);
        } else {
            alert("Bitte wähle eine Seite aus!");
        }
    });

    // Synchronisiere Änderungen mit der Originalseite
    window.addEventListener("message", (event) => {
        const { index, content } = event.data;
        const pages = JSON.parse(localStorage.getItem("pages") || "[]");

        if (index === 0) {
            // Aktualisiere die Startseite
            document.open();
            document.write(content);
            document.close();
            alert("Änderungen wurden auf die Startseite angewendet!");
        } else {
            // Aktualisiere andere Seiten
            pages[index - 1].content = content;
            localStorage.setItem("pages", JSON.stringify(pages));
            alert("Änderungen wurden synchronisiert!");
        }
    });

    // Initialisiere Seitenverwaltung
    loadPages();
});
