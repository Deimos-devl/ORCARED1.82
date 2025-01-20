// Banco de dados dos produtos
const produtos = {
    injetaveis: {
        "Enantato de Testo": 195,
        "Cipionato de testo": 175,
        "Durateston": 195,
        "Propionato de testo": 170,
        "Deca": 195,
        "NPP": 170,
        "Trembo Acetato": 180,
        "Trembo Enantato": 210,
        "Tri-Trembo": 190,
        "RedBlend": 195,
        "Masteron": 210,
        "Primobolan": 290,
        "Boldenona": 195,
        "HCG": 210,
        "Stanozolol Oily": 160,
    },
    orais: {
        "Hemogenin 5mg": 150,
        "Hemogenin 50mg": 170,
        "Oxandrolona 5mg": 120,
        "Oxandrolona 10mg": 170,
        "Oxandrolona 20mg": 259,
        "Stanozolol 10mg": 150,
        "Dianabol": 150,
        "Proviron": 110,
        "Tadalafil": 90,
        "Finasterida": 70,
        "Tamoxifeno": 97,
        "Anastrozol": 97,
        "Espironolactona": 65,
        "Clenbuterol": 99,
        "Seca Tudo": 99,
        "Emagrecedor": 99,
        "Roacutan 5mg": 60,
        "Roacutan 20mg": 150,
        "Minoxired": 50,
        "Diladrol": 75,
    },
};

// Formatter global para formatar valores monetários
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

function formatarMoeda(valor) {
    return formatter.format(valor).replace(/\s/g, "");
}

// Definição dos combos
const combos = [
    {
        nome: "Combo Aço 🛡️",
        preco: 457,
        unidade: 152.33,
        condicao: (quantidade) => quantidade === 3,
        brindes: 0,
    },
    {
        nome: "Combo Bronze 🥉",
        preco: 797,
        unidade: 132,
        condicao: (quantidade) => quantidade >= 6 && quantidade < 7,
        brindes: 0,
    },
    {
        nome: "Combo Prata 🥈",
        preco: 1087,
        unidade: 120,
        condicao: (quantidade) => quantidade >= 7 && quantidade < 12,
        brindes: 2,
    },
    {
        nome: "Combo Ouro 🥇",
        preco: 1687,
        unidade: 112,
        condicao: (quantidade) => quantidade >= 12 && quantidade < 16,
        brindes: 3,
    },
    {
        nome: "Combo Diamante 💎",
        preco: 2187,
        unidade: 109.35,
        condicao: (quantidade) => quantidade >= 16,
        brindes: 4,
        adicionais: ["1 camisa", "1 coqueteleira"],
    },
];

const produtosExcluidos = ["Oxandrolona 20mg", "Primobolan", "HCG"];

// Função para preencher os produtos na página
function preencherProdutos() {
    const injetaveisContainer = document.getElementById("injetaveis");
    const oraisContainer = document.getElementById("orais");

    function criarProduto(nome, preco, container) {
        const div = document.createElement("div");
        div.classList.add("produto");
        div.innerHTML = `
            <span>${nome}</span>
            <span>${formatarMoeda(preco)}</span>
            <div class="produto-controls">
                <button class="btn-ajustar" onclick="ajustarQuantidade(this, -1)">-</button>
                <input type="number" min="0" value="0">
                <button class="btn-ajustar" onclick="ajustarQuantidade(this, 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    }

    Object.entries(produtos.injetaveis).forEach(([nome, preco]) => criarProduto(nome, preco, injetaveisContainer));
    Object.entries(produtos.orais).forEach(([nome, preco]) => criarProduto(nome, preco, oraisContainer));
}

// Ajustar quantidade
function ajustarQuantidade(button, delta) {
    const input = button.parentElement.querySelector("input");
    input.value = Math.max(0, parseInt(input.value) + delta);
}

// Gerenciar desconto
const checkboxDesconto = document.getElementById("aplicar-desconto");
const inputDesconto = document.getElementById("porcentagem-desconto");

checkboxDesconto.addEventListener("change", () => {
    inputDesconto.disabled = !checkboxDesconto.checked;
    if (!checkboxDesconto.checked) inputDesconto.value = 0;
});

// Gerar orçamento
document.getElementById("gerar-orcamento").addEventListener("click", () => {
    let total = 0;
    const produtosSelecionados = [];
    const tipoFrete = document.querySelector("input[name='frete']:checked").value;
    const modoCombo = document.querySelector("input[name='modo']:checked").value === "combo";
    const desconto = parseFloat(inputDesconto.value) || 0;

    document.querySelectorAll("#injetaveis .produto, #orais .produto").forEach((div) => {
        const quantidade = parseInt(div.querySelector("input").value);
        if (quantidade > 0) {
            const nome = div.querySelector("span:first-child").textContent;
            const preco = parseFloat(div.querySelector("span:nth-child(2)").textContent.replace(/[^0-9,]/g, '').replace(',', '.'));
            produtosSelecionados.push({ nome, quantidade, preco });
        }
    });

    if (modoCombo) {
        const comboAplicado = aplicarCombo(produtosSelecionados);

        if (comboAplicado) {
            total = comboAplicado.preco;

            if (desconto > 0) total -= total * (desconto / 100);

            const brindesMensagem = comboAplicado.brindes > 0 ? `\n+ ${comboAplicado.brindes} produtos de brinde 🎁` : '';
            const adicionaisMensagem = comboAplicado.adicionais && comboAplicado.adicionais.length > 0
                ? `\n+ ${comboAplicado.adicionais.join(", ")}`
                : '';

            const mensagem = `
Total de ${formatarMoeda(total + (tipoFrete === "PAC" ? 40 : tipoFrete === "Sedex" ? 55 : 80))} já com o frete incluso (${tipoFrete})
🔥 Nossa garantia é 100% gratuita! 🔥 ${comboAplicado.nome}

Seu novo pedido será 📦:
${comboAplicado.produtosValidos.map(p => `${p.quantidade}x ${p.nome}`).join("\n")}${brindesMensagem}${adicionaisMensagem}

Podemos fechar o seu pedido para você garantir seu desconto? 🎁
            `.trim();

            navigator.clipboard.writeText(mensagem).then(() => {
                alert("Orçamento gerado e copiado para a área de transferência!");
                resetarQuantidades();
            });
        } else {
            alert("Selecione a quantidade correta de produtos para um dos combos (3, 6, 7, 12 ou 16 produtos).");
        }
    }
});

// Função para resetar as quantidades dos produtos
function resetarQuantidades() {
    document.querySelectorAll("input[type='number']").forEach(input => {
        input.value = 0;
    });
}

// Função para aplicar combo
function aplicarCombo(produtosSelecionados) {
    let totalProdutos = 0;
    let produtosValidos = [];

    produtosSelecionados.forEach(({ nome, quantidade }) => {
        if (!produtosExcluidos.includes(nome)) {
            totalProdutos += quantidade;
            produtosValidos.push({ nome, quantidade });
        }
    });

    for (const combo of combos) {
        if (combo.condicao(totalProdutos)) {
            return {
                nome: combo.nome,
                preco: combo.preco,
                unidade: combo.unidade,
                brindes: combo.brindes,
                produtosValidos,
                adicionais: combo.adicionais || [],
            };
        }
    }

    return null;
}

// Inicializar
preencherProdutos();
