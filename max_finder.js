
const fs = require('fs');

function getMax(filePath, regex) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.matchAll(regex);
        let max = -1;
        for (const match of matches) {
            const val = parseInt(match[1]);
            if (val > max) max = val;
        }
        return max;
    } catch (e) {
        return 'Error: ' + e.message;
    }
}

const results = {
    Socios: {
        dataSource: getMax('d:/PROJETOS/Sindplast WEB/DataSource/Socios.json', /"SMAT"\s*:\s*(\d+)/g),
        legado: getMax('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/Socios.json', /"SMAT"\s*:\s*(\d+)/g)
    },
    Empresas: {
        dataSource: getMax('d:/PROJETOS/Sindplast WEB/DataSource/Empresas.json', /"ECODIG"\s*:\s*(\d+)/g),
        legado: getMax('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/Empresas.json', /"ECODIG"\s*:\s*(\d+)/g)
    },
    Dependentes: {
        dataSource: getMax('d:/PROJETOS/Sindplast WEB/DataSource/Dependentes.json', /"Código"\s*:\s*(\d+)/g),
        legado: getMax('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/DependentesFinal.json', /"CodDependente"\s*:\s*(\d+)/g)
    }
};

console.log('MAX_START');
console.log(JSON.stringify(results, null, 2));
console.log('MAX_END');
