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

// Formatter global para garantir consistência no formato de moeda
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

// Função para formatar valores e remover o espaço entre "R$" e o valor
function formatarMoeda(valor) {
    return formatter.format(valor).replace(/\s/g, ""); // Remove espaços no resultado
}

// Definição dos combos
const combos = [
    {
        nome: "Combo Bronze",
        preco: 797,
        unidade: 132,
        condicao: (quantidade) => quantidade >= 6 && quantidade < 7,
        brindes: 0,
        descricao: "a partir de 6 produtos da sua escolha",
    },
    {
        nome: "Combo Prata",
        preco: 1087,
        unidade: 120,
        condicao: (quantidade) => quantidade >= 7 && quantidade < 12,
        brindes: 2,
        descricao: "a partir de 7, leve 9 (2 produtos de brinde)",
    },
    {
        nome: "Combo Ouro",
        preco: 1687,
        unidade: 112,
        condicao: (quantidade) => quantidade >= 12 && quantidade < 16,
        brindes: 3,
        descricao: "a partir de 12, leve 15 (3 produtos de brinde)",
    },
    {
        nome: "Combo Diamante",
        preco: 2187,
        unidade: 109.35,
        condicao: (quantidade) => quantidade >= 16,
        brindes: 4,
        descricao: "a partir de 16, leve 20 (4 produtos de brinde)",
    },
];

// Produtos excluídos dos combos
const produtosExcluidos = ["Oxandrolona 20mg", "Primobolan", "HCG"];

// Função para verificar e aplicar combos
function aplicarCombo(produtosSelecionados) {
    let totalProdutos = 0;
    let produtosValidos = [];

    // Filtrar produtos válidos para combos
    produtosSelecionados.forEach(({ nome, quantidade }) => {
        if (!produtosExcluidos.includes(nome)) {
            totalProdutos += quantidade;
            produtosValidos.push({ nome, quantidade });
        }
    });

    // Verificar se há algum combo aplicável
    for (const combo of combos) {
        if (combo.condicao(totalProdutos)) {
            return {
                nome: combo.nome,
                preco: combo.preco,
                unidade: combo.unidade,
                brindes: combo.brindes,
                produtosValidos,
                totalProdutos,
            };
        }
    }

    // Sem combo aplicável
    return null;
}

// Renderizar os produtos
function renderProdutos(tipo, containerId) {
    const container = document.getElementById(containerId);
    Object.entries(produtos[tipo]).forEach(([produto, preco]) => {
        const div = document.createElement("div");
        div.className = "produto";
        div.innerHTML = `
            <span>${produto} - ${formatarMoeda(preco)}</span>
            <button onclick="ajustarQuantidade(this, -1)">-</button>
            <input type="number" value="0" min="0" />
            <button onclick="ajustarQuantidade(this, 1)">+</button>
        `;
        container.appendChild(div);
    });
}

// Ajustar quantidade
function ajustarQuantidade(button, delta) {
    const input = button.parentElement.querySelector("input");
    const novaQuantidade = Math.max(0, parseInt(input.value) + delta);
    input.value = novaQuantidade;
}

// Gerar orçamento
document.getElementById("gerar-orcamento").addEventListener("click", () => {
    let total = 0;
    const produtosSelecionados = [];
    const tipoFrete = document.querySelector("input[name='frete']:checked").value;
    const modoCombo = document.querySelector("input[name='modo']:checked").value === "combo";

    // Mapear tipo de frete para exibir apenas "Sedex"
    const tipoFreteFormatado = tipoFrete.includes("Sedex") ? "Sedex" : tipoFrete;

    // Injetáveis
    document.querySelectorAll("#injetaveis .produto").forEach((div, i) => {
        const quantidade = parseInt(div.querySelector("input").value);
        if (quantidade > 0) {
            const nome = Object.keys(produtos.injetaveis)[i];
            const preco = produtos.injetaveis[nome];
            produtosSelecionados.push({ nome, quantidade, preco });
        }
    });

    // Orais
    document.querySelectorAll("#orais .produto").forEach((div, i) => {
        const quantidade = parseInt(div.querySelector("input").value);
        if (quantidade > 0) {
            const nome = Object.keys(produtos.orais)[i];
            const preco = produtos.orais[nome];
            produtosSelecionados.push({ nome, quantidade, preco });
        }
    });

    if (modoCombo) {
        // Aplicar combos
        const comboAplicado = aplicarCombo(produtosSelecionados);

        if (comboAplicado) {
            total = comboAplicado.preco;
            const mensagem = `
Total de ${formatarMoeda(total + (tipoFrete === "PAC" ? 40 : tipoFrete === "Sedex" ? 55 : tipoFrete === "Sedex-" ? 65 : 80))} já com o frete incluso (${tipoFreteFormatado})
🔥 Nossa garantia é 100% gratuita! 🔥

Seu novo pedido será 📦:
${comboAplicado.produtosValidos.map(p => `${p.quantidade}x ${p.nome} (${comboAplicado.nome})`).join("\n")}
${comboAplicado.brindes > 0 ? `+ ${comboAplicado.brindes} produtos de brinde 🎁` : ""}

Podemos fechar o seu pedido para você garantir seu desconto? 🎁
            `.trim();

            navigator.clipboard.writeText(mensagem).then(() => {
                alert("Orçamento gerado e copiado para a área de transferência!");
                document.querySelectorAll("input[type='number']").forEach(input => input.value = 0);
            });
        } else {
            alert("Nenhum combo aplicável para a seleção atual!");
        }
    } else {
        // Calcular total normal
        produtosSelecionados.forEach(({ quantidade, preco }) => {
            total += quantidade * preco;
        });
        total += tipoFrete === "PAC" ? 40 : tipoFrete === "Sedex" ? 55 : tipoFrete === "Sedex-" ? 65 : 80;

        const mensagem = `
Total de ${formatarMoeda(total)} já com o frete incluso (${tipoFreteFormatado})
🔥 Garanta seu Cashback, nossa garantia é 100% gratuita! 🔥

Seu novo pedido será 📦:
${produtosSelecionados.map(p => `${p.quantidade}x ${p.nome} ${formatarMoeda(p.quantidade * p.preco)}`).join("\n")}

Podemos fechar o seu pedido para você garantir seu Cashback? 🎁
        `.trim();

        navigator.clipboard.writeText(mensagem).then(() => {
            alert("Orçamento gerado e copiado para a área de transferência!");
            document.querySelectorAll("input[type='number']").forEach(input => input.value = 0);
        });
    }
});

// Inicializar
renderProdutos("injetaveis", "injetaveis");
renderProdutos("orais", "orais");
