module.exports = class Popup {
    constructor(id, type, title, content, script) {
        this.id = `popup_${id}`;
        this.type = type;
        this.title = title;
        this.content = content;
        this.script = script;
    }
    toHTML() {
        return `
        <div class="popup ${this.type}" id="${this.id}">
            <div>
                <h1>${this.title}</h1>
                <p>${this.content}</p>
                <button onclick="buttonPress()">OK</button>
                <script>
                    function buttonPress() {
                        (${this.script})();
                        $("#${this.id}").hide();
                    }
                </script>
            </div>
        </div>
        `;
    }
}