// Texto atual das páginas legais do site (inova-institutional), extraído do
// que é renderizado em /politica-de-privacidade e /termos-de-uso, para o painel
// partir dele ao ativar legal_privacy / legal_terms.
//
// Formato: { title, updatedAtLabel, sections }, com Section igual à do artigo
// (texto simples em pt). Formatação inline (negrito) e o link da política dentro
// dos Termos viram texto simples; a caixa de aceite em maiúsculas vira "callout".
// A linha divisória entre seções não existe no formato (o h2 já separa).

export type LegalSection =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; tone: "info" | "warning" | "success"; text: string };

export type LegalDefault = {
  title: string;
  updatedAtLabel: string;
  sections: LegalSection[];
};

export const legalPrivacyDefault: LegalDefault = {
  "title": "Política de Privacidade do Aplicativo INOVA",
  "updatedAtLabel": "Última Atualização: 29 de Janeiro de 2026",
  "sections": [
    {
      "kind": "p",
      "text": "A presente Política de Privacidade (\"Política\") descreve como INOVA (doravante denominada \"Empresa\" ou \"Nós\") coleta, usa, armazena, compartilha e protege as informações e dados pessoais dos Usuários do aplicativo \"INOVA\" (\"Aplicativo\")."
    },
    {
      "kind": "p",
      "text": "A Empresa está comprometida com a privacidade e a segurança dos dados pessoais, atuando em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD) e demais normas sobre proteção de dados aplicáveis no Brasil."
    },
    {
      "kind": "callout",
      "tone": "info",
      "text": "AO ACESSAR, INSTALAR, UTILIZAR OU SE CADASTRAR NO APLICATIVO INOVA, VOCÊ (\"USUÁRIO\") DECLARA TER LIDO, ENTENDIDO E CONCORDADO COM ESTA POLÍTICA DE PRIVACIDADE, BEM COMO COM OS TERMOS DE USO DO APLICATIVO. CASO NÃO CONCORDA COM QUALQUER DISPOSIÇÃO DESTA POLÍTICA, O USUÁRIO NÃO DEVERÁ UTILIZAR O APLICATIVO."
    },
    {
      "kind": "h2",
      "text": "1. Controlador de Dados e Abrangência"
    },
    {
      "kind": "p",
      "text": "1.1. Para os Dados Pessoais dos Usuários (como nome, CPF e e-mail corporativo), coletados estritamente para o registro, autenticação e controle de acesso ao Aplicativo INOVA, a Empresa INOVA atua como Controladora de Dados Pessoais. Nesse papel, definimos as finalidades e os meios limitados de tratamento desses dados, focados na funcionalidade e segurança do sistema."
    },
    {
      "kind": "p",
      "text": "1.2. Para os dados técnicos de equipamentos, históricos de manutenção, fotos e documentos carregados (ex: Instruções de Trabalho, Cartão CNPJ), que são de propriedade da Empresa Contratante (cliente do seu cliente), a Empresa atua como Operadora de Dados, realizando o tratamento em nome e sob as instruções da Empresa Contratante, que é a Controladora desses dados."
    },
    {
      "kind": "p",
      "text": "1.3. Esta Política se aplica a todos os Usuários do Aplicativo INOVA, disponível para dispositivos móveis (iOS e Android), e que se destina exclusivamente a uso corporativo por profissionais adultos."
    },
    {
      "kind": "h2",
      "text": "2. Quais Dados Coletamos e as Finalidades"
    },
    {
      "kind": "p",
      "text": "A Empresa coleta diferentes tipos de informações para operar, fornecer, aprimorar, entender e apoiar o INOVA."
    },
    {
      "kind": "p",
      "text": "2.1. Dados Pessoais Coletados Diretamente do Usuário: a) Dados de Identificação e Contato: Nome completo, CPF, e-mail (para comunicação sobre o serviço e suporte, e validação de identidade). b) Dados Profissionais: Cargo, departamento (para contextualização do uso e personalização de funcionalidades dentro do ambiente corporativo). c). d) Dados da Empresa Contratante: CNPJ da empresa para a qual o Usuário trabalha (para vinculação da conta do Usuário ao contrato de licenciamento da Empresa Contratante e gestão das licenças). e) Credenciais de Acesso: Senha (armazenada de forma criptografada) para a segurança da conta do Usuário. Finalidade Principal: Gerenciar o acesso e a segurança da conta do Usuário, identificar o Usuário para a prestação dos serviços do INOVA, comunicar-se sobre o serviço, fornecer suporte técnico e cumprir obrigações legais. Base Legal da LGPD: Execução de contrato ou procedimentos preliminares relacionados ao contrato (Art. 7, V, LGPD) e Legítimo Interesse (Art. 7, IX, LGPD), na medida em que o tratamento é essencial para a operação e aprimoramento do serviço."
    },
    {
      "kind": "p",
      "text": "2.2. Dados Gerados pelo Uso do Aplicativo (Dados de Uso): a) Dados de Dispositivo e Conexão: Endereço IP do dispositivo, tipo de dispositivo móvel, sistema operacional, identificadores únicos do dispositivo, informações básicas da rede móvel ou Wi-Fi utilizada. b) Dados de Interação com o Aplicativo: Telas acessadas, funcionalidades utilizadas, tempo de uso, cliques em botões, dados de desempenho do Aplicativo (ex: tempo de carregamento, erros de software ou travamentos). Finalidade Principal: Monitorar o desempenho e a estabilidade do Aplicativo, identificar e corrigir erros, entender padrões de uso para aprimorar funcionalidades e a experiência do Usuário, garantir a segurança da infraestrutura de TI e oferecer um serviço robusto e eficiente. Base Legal da LGPD: Legítimo Interesse (Art. 7, IX, LGPD), na medida em que o tratamento é essencial para a segurança, manutenção e melhoria contínua do serviço, e Execução de contrato (Art. 7, V, LGPD)."
    },
    {
      "kind": "p",
      "text": "2.3. Conteúdo Inserido pelo Usuário (Dados de Manutenção da Empresa Contratante): a) Dados cadastrais e operacionais de equipamentos, históricos de manutenção, fotos de equipamentos, arquivos de Instruções de Trabalho, informações de Cartão CNPJ da Empresa Contratante (quando aplicável ao processo), anotações, relatórios e outros documentos técnicos e operacionais relacionados à gestão de ativos e manutenção industrial. Finalidade Principal: Armazenar, processar e gerenciar, conforme as funcionalidades do INOVA, todos os dados e informações referentes à manutenção industrial, sob instrução e estrita responsabilidade da Empresa Contratante. Base Legal da LGPD: A Empresa atua como Operadora de Dados para este tipo de informação, e a base legal para o tratamento é a execução de contrato (Art. 7, V, LGPD) entre a Empresa e a Empresa Contratante, que detém o controle e a responsabilidade primária sobre esses dados perante seus próprios clientes, funcionários ou terceiros."
    },
    {
      "kind": "h2",
      "text": "3. Como Armazenamos e Retemos os Dados"
    },
    {
      "kind": "p",
      "text": "3.1. A Empresa utiliza provedores de serviços de computação em nuvem para armazenar todos os dados coletados de forma segura e eficiente. Os dados são armazenados em infraestruturas que oferecem alta disponibilidade, segurança física e lógica, e são protegidos por criptografia em trânsito e em repouso, Amazon Web Services (AWS), Google Cloud Platform (GCP) ou Microsoft Azure. Podem estar localizados no Brasil e/ou em outras jurisdições como Estados Unidos e União Europeia. Ver item 5 para Transferência Internacional."
    },
    {
      "kind": "p",
      "text": "3.2. Os dados são retidos apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados, para cumprir obrigações legais ou regulatórias (ex: marcos legais como o Marco Civil da Internet), ou para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais. a) Dados Pessoais dos Usuários (Cadastro e Uso): Retidos enquanto a conta do Usuário estiver ativa e pelo período adicional de 2 anos após o encerramento da conta para fins de cumprimento de obrigações legais, auditoria e fiscalização. b) Conteúdo Inserido pelo Usuário (Dados de Manutenção da Empresa Contratante): Retidos conforme o contrato de licenciamento/assinatura entre a Empresa (nós) e a Empresa Contratante. Ao final do contrato ou a pedido da Empresa Contratante, esses dados serão excluídos, anonimizados ou retornados à Empresa Contratante, conforme acordado no instrumento contratual."
    },
    {
      "kind": "h2",
      "text": "4. Compartilhamento de Dados"
    },
    {
      "kind": "p",
      "text": "4.1. A Empresa poderá compartilhar os dados pessoais dos Usuários e os dados de manutenção da Empresa Contratante nas seguintes situações e com os seguintes parceiros, observando sempre os princípios de segurança, minimização e conformidade com a LGPD:"
    },
    {
      "kind": "ul",
      "items": [
        "Provedores de Serviços de Tecnologia: Para a hospedagem e armazenamento de dados em nuvem, manutenção e suporte da infraestrutura tecnológica. Esses provedores atuam como operadores de dados, sob as instruções da Empresa e com as devidas garantias contratuais de sigilo e segurança. (Ex: Amazon Web Services (AWS), Google Cloud Platform (GCP) ou Microsoft Azure).",
        "Ferramentas de Análise de Desempenho: Para monitorar o uso e o desempenho do Aplicativo, identificar tendências, solucionar problemas e aprimorar a experiência do Usuário e as funcionalidades do Aplicativo. (Ex: Google Analytics for Firebase, ferramentas de monitoramento de erros como Sentry ou Crashlytics). Este compartilhamento é para fins de análise agregada e anonimizada sempre que possível.",
        "Com a Empresa Contratante: Os dados pessoais do Usuário (nome, e-mail, cargo, etc.) são compartilhados com e acessíveis à Empresa Contratante para a gestão interna de pessoal, gestão do licenciamento do software e acompanhamento do uso. O conteúdo de manutenção inserido pelo Usuário é, por natureza, acessível e de propriedade da Empresa Contratante, que é sua Controladora.",
        "Para Cumprimento Legal ou Judicial: Se exigido por lei, ordem judicial, regulamentação governamental ou qualquer outra solicitação legal de autoridades competentes.",
        "Em Caso de Reorganização Societária: Em caso de fusão, aquisição, venda de ativos ou qualquer reestruturação societária, os dados podem ser transferidos como parte dos ativos da Empresa, garantindo-se a continuidade da proteção dos dados."
      ]
    },
    {
      "kind": "p",
      "text": "4.2. A Empresa NÃO COMPARTILHA dados pessoais com terceiros para fins de marketing, publicidade ou pesquisa não relacionada diretamente ao serviço do INOVA, nem para fins de treinamento de modelos de Inteligência Artificial sem o consentimento explícito dos titulares ou base legal específica. O INOVA não exibe anúncios para os seus Usuários."
    },
    {
      "kind": "h2",
      "text": "5. Transferência Internacional de Dados"
    },
    {
      "kind": "p",
      "text": "5.1. Para a hospedagem de dados e a utilização de ferramentas de análise de desempenho, pode haver transferência de dados para outros países, especialmente para os Estados Unidos da América ou países da União Europeia, onde estão localizados os servidores e/ou as sedes dos provedores de serviços tecnológicos da Empresa."
    },
    {
      "kind": "p",
      "text": "5.2. A Empresa garante que, em caso de transferência internacional de dados, serão adotadas todas as medidas apropriadas para proteger a privacidade e os direitos dos titulares de dados, em conformidade com a LGPD, utilizando mecanismos legais como cláusulas contratuais-padrão aprovadas, normas corporativas globais ou a verificação de que o país de destino oferece um nível de proteção de dados adequado."
    },
    {
      "kind": "p",
      "text": "5.3. Ao utilizar o Aplicativo INOVA, o Usuário expressamente concorda com essa transferência internacional de dados para as finalidades descritas nesta Política."
    },
    {
      "kind": "h2",
      "text": "6. Segurança dos Dados"
    },
    {
      "kind": "p",
      "text": "6.1. A Empresa implementa medidas de segurança técnicas e administrativas robustas e atualizadas para proteger os dados pessoais dos Usuários e as informações da Empresa Contratante contra acesso não autorizado, uso indevido, alteração, divulgação, perda ou destruição acidental ou ilícita. Essas medidas incluem: a) Criptografia de dados em trânsito (ex: HTTPS/TLS) e em repouso nos bancos de dados. b) Controle de acesso rigoroso aos sistemas e dados, baseado no princípio do mínimo privilégio (acesso apenas a quem realmente precisa e apenas ao que é necessário). c) Autenticação multifator para acesso administrativo a sistemas sensíveis. d) Backups regulares dos dados e planos de recuperação de desastres. e) Auditorias de segurança e monitoramento contínuo da infraestrutura. f) Uso de senhas fortes e gestão de acesso para Usuários."
    },
    {
      "kind": "p",
      "text": "6.2. Embora a Empresa adote todos os esforços razoáveis para proteger os dados, nenhum sistema de segurança é totalmente impenetrável. Assim, o Usuário também tem um papel crucial na segurança de seus dados, protegendo suas credenciais de acesso, utilizando senhas fortes e não compartilhando seu login. A Empresa não se responsabiliza por falhas de segurança decorrentes de falha do Usuário em proteger suas credenciais."
    },
    {
      "kind": "h2",
      "text": "7. Direitos do Titular dos Dados"
    },
    {
      "kind": "p",
      "text": "7.1. O Usuário, como titular dos dados pessoais, possui os seguintes direitos, garantidos pela LGPD, e pode exercê-los entrando em contato com a Empresa através do e-mail de suporte (Cláusula 9): a) Confirmação e Acesso: Obter a confirmação de que tratamos seus dados e, em caso positivo, ter acesso a eles. b) Retificação: Exigir a correção de dados incompletos, inexatos ou desatualizados. c) Anonimização, Bloqueio ou Eliminação: Solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD. d) Portabilidade: Requisitar a portabilidade dos seus dados a outro fornecedor de serviço ou produto, mediante requisição expressa e observados os segredos comercial e industrial. e) Eliminação: Solicitar a eliminação dos dados pessoais tratados com base em seu consentimento, exceto nas hipóteses previstas em lei. f) Informação sobre Compartilhamento: Ser informado sobre as entidades públicas e privadas com as quais a Empresa realizou o uso compartilhado de seus dados. g) Revogação do Consentimento: Revogar o consentimento a qualquer momento, quando este for a base legal para o tratamento dos dados, sem prejuízo da licitude do tratamento realizado antes da revogação. h) Oposição: Opor-se a tratamento de dados que não esteja em conformidade com a LGPD."
    },
    {
      "kind": "p",
      "text": "7.2. Para exercer qualquer um desses direitos, o Usuário deverá contatar a Empresa através do e-mail inova.sistemas.adm@gmail.com. A Empresa se compromete a analisar e responder às solicitações em conformidade com a legislação aplicável, envidando esforços para atender às requisições no prazo legal."
    },
    {
      "kind": "h2",
      "text": "8. Alterações desta Política de Privacidade"
    },
    {
      "kind": "p",
      "text": "8.1. A Empresa reserva-se o direito de modificar esta Política de Privacidade a qualquer momento, a seu exclusivo critério, para adaptá-la a novas funcionalidades, requisitos legais (incluindo novas disposições da LGPD ou de outras leis) ou melhorias operacionais."
    },
    {
      "kind": "p",
      "text": "8.2. O Usuário será notificado sobre quaisquer alterações significativas através de um pop-up no Aplicativo na próxima vez que ele for acessado ou por e-mail ao endereço cadastrado. A versão atualizada desta Política de Privacidade também será disponibilizada dentro do Aplicativo e no site da Empresa (se houver)."
    },
    {
      "kind": "p",
      "text": "8.3. A continuidade do uso do INOVA após a notificação das alterações constituirá aceitação tácita do Usuário à Política de Privacidade revisada. Caso o Usuário não concorde com as modificações, ele deverá cessar o uso do Aplicativo e exercer seus direitos como titular de dados."
    },
    {
      "kind": "h2",
      "text": "9. Contato e Encarregado de Proteção de Dados (DPO)"
    },
    {
      "kind": "p",
      "text": "9.1. Para quaisquer dúvidas, solicitações de direitos como titular de dados ou questões sobre esta Política de Privacidade, entre em contato conosco através do e-mail: inova.sistemas.adm@gmail.com."
    },
    {
      "kind": "h2",
      "text": "10. Legislação Aplicável e Foro"
    },
    {
      "kind": "p",
      "text": "10.1. Esta Política de Privacidade é regida e interpretada de acordo com as leis da República Federativa do Brasil, especialmente a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais – LGPD)."
    },
    {
      "kind": "p",
      "text": "10.2. As partes elegem o Foro da Comarca de Curitiba, Estado do Paraná, para dirimir quaisquer dúvidas, litígios ou questões decorrentes desta Política, renunciando a qualquer outro, por mais privilegiado que seja."
    }
  ]
};

export const legalTermsDefault: LegalDefault = {
  "title": "Termos de Uso do Aplicativo INOVA",
  "updatedAtLabel": "Última Atualização: 29 de Janeiro de 2026",
  "sections": [
    {
      "kind": "p",
      "text": "Este Termo de Uso (\"Termos\") regulamenta o acesso e a utilização do aplicativo móvel INOVA (doravante denominado \"Aplicativo\" ou \"INOVA\")."
    },
    {
      "kind": "callout",
      "tone": "info",
      "text": "AO ACESSAR, UTILIZAR OU SE CADASTRAR NO APLICATIVO INOVA, VOCÊ (\"USUÁRIO\") DECLARA TER LIDO, ENTENDIDO E CONCORDADO COM ESTES TERMOS DE USO E COM A POLÍTICA DE PRIVACIDADE DO APLICATIVO. CASO NÃO CONCORDA COM QUALQUER DISPOSIÇÃO DESTES TERMOS, O Usuário não deverá utilizar o Aplicativo."
    },
    {
      "kind": "p",
      "text": "A Empresa se reserva o direito de alterar estes Termos a qualquer momento, e as alterações serão comunicadas conforme Cláusula 9.1."
    },
    {
      "kind": "h2",
      "text": "Considerações importantes"
    },
    {
      "kind": "ul",
      "items": [
        "O uso do Aplicativo INOVA é exclusivo para uso corporativo, por profissionais adultos de empresas que buscam otimizar suas operações de manutenção industrial.",
        "A forma como seus dados pessoais e outras informações são coletados, usados, armazenados e protegidos é detalhada em nossa Política de Privacidade, disponível em Política de Privacidade. Ao aceitar este Termo, você também concorda com os termos da nossa Política de Privacidade.",
        "Os administradores da Empresa Contratante do INOVA são responsáveis por gerenciar o acesso e o uso por seus Usuários internos."
      ]
    },
    {
      "kind": "h2",
      "text": "1. O que é o INOVA"
    },
    {
      "kind": "p",
      "text": "1.1. O INOVA é um aplicativo móvel desenvolvido para auxiliar profissionais de empresas industriais na gestão e otimização de manutenção. Seu objetivo principal é o controle eficiente de equipamentos, registro de histórico de manutenção, projeção de investimentos e suporte à conformidade com normas como ISO 55.000 e ICML 55."
    },
    {
      "kind": "p",
      "text": "1.2. Além das funcionalidades de gestão de manutenção, o Aplicativo permite ao Usuário: a) Cadastro detalhado de equipamentos e acompanhamento de serviços realizados; b) Receber notificações automatizadas e alertas de manutenção baseados em condições operacionais; c) Gerar Ordens de Serviço (OS) automaticamente, com anexos como checklists e manuais; d) Utilizar uma calculadora de lubrificação e análise de custos/ROI; e) Acessar suporte técnico assistido por Inteligência Artificial (IA) com base em dados históricos; f) Gerenciar interações e registrar feedback para melhoria contínua; g) Acompanhar painéis de controle (Dashboards) inteligentes com KPIs e ROI, incluindo previsões detalhadas de investimentos e eficiências operacionais."
    },
    {
      "kind": "p",
      "text": "1.3. O INOVA é uma ferramenta de apoio à gestão industrial, visando otimizar a organização e execução de processos de manutenção, não substituindo, em hipótese alguma, o prontuário técnico oficial, decisões de engenharia ou o discernimento profissional do Usuário."
    },
    {
      "kind": "h2",
      "text": "2. Cadastro e Acesso ao Aplicativo"
    },
    {
      "kind": "p",
      "text": "2.1. Para utilizar o Aplicativo INOVA e suas funcionalidades, o Usuário deverá pertencer a uma Empresa Contratante que tenha adquirido uma licença de uso do Aplicativo e deverá realizar um cadastro, fornecendo informações verdadeiras, precisas, completas e atualizadas, conforme solicitado. O uso do Aplicativo é exclusivamente para profissionais adultos no contexto corporativo."
    },
    {
      "kind": "p",
      "text": "2.2. O Usuário é o único responsável pela guarda e sigilo de seu login e senha, e deverá notificar imediatamente a Empresa em caso de qualquer uso não autorizado de sua conta ou quebra de segurança."
    },
    {
      "kind": "p",
      "text": "2.3. A Empresa não se responsabiliza por perdas e danos decorrentes do não cumprimento do disposto nesta seção por parte do Usuário ou da Empresa Contratante."
    },
    {
      "kind": "h2",
      "text": "3. Planos de Serviço e Cobrança"
    },
    {
      "kind": "p",
      "text": "3.1. O acesso ao INOVA é concedido aos Usuários por meio de licenças ou assinaturas corporativas adquiridas pela Empresa Contratante junto à Empresa (nós). O modelo de negócio do INOVA é baseado na sua utilização na operação interna das empresas e posterior comercialização para seus próprios clientes."
    },
    {
      "kind": "p",
      "text": "3.2. As condições específicas de cada plano, incluindo funcionalidades, limites de uso, preços, período de cobrança, métodos de pagamento e políticas de renovação, são estabelecidas em contrato separado entre a Empresa (nós) e a Empresa Contratante."
    },
    {
      "kind": "p",
      "text": "3.3. O cancelamento de qualquer plano pela Empresa Contratante deverá seguir o procedimento estipulado no contrato de licenciamento/assinatura. O cancelamento poderá acarretar na perda de acesso às funcionalidades e/ou informações para os Usuários vinculados a essa Empresa Contratante, ao final do período de cobrança pago."
    },
    {
      "kind": "p",
      "text": "3.4. A Empresa reserva-se o direito de alterar os preços dos planos ou introduzir novas cobranças, mediante comunicação prévia à Empresa Contratante, conforme estabelecido em contrato específico. Usuários finais não receberão comunicação direta sobre preços, salvo se a alteração impactar diretamente sua experiência de uso e a Empresa Contratante o notificar adequadamente."
    },
    {
      "kind": "h2",
      "text": "4. Uso Adequado do Aplicativo e Responsabilidades do Usuário"
    },
    {
      "kind": "p",
      "text": "4.1. O Usuário compromete-se a utilizar o INOVA de forma ética, profissional e em conformidade com a legislação brasileira, especialmente a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD) e quaisquer normas regulatórias aplicáveis à sua profissão ou setor."
    },
    {
      "kind": "p",
      "text": "4.2. Conteúdo Gerado pelo Usuário (UGC): O Usuário poderá fazer upload e inserir no Aplicativo dados e conteúdos como cadastro de equipamentos, históricos de manutenção, fotos de equipamentos, arquivos de Instruções de Trabalho, Cartão CNPJ e outros documentos ou informações pertinentes à gestão de manutenção. a) O Usuário é o ÚNICO E EXCLUSIVO RESPONSÁVEL pela veracidade, licitude e pertinência de todo o conteúdo inserido no Aplicativo, garantindo que possui os direitos e autorizações necessárias para o processamento e armazenamento de tais dados. b) A Empresa NÃO SE RESPONSABILIZA por qualquer uso indevido do Aplicativo ou pela inserção de dados que violem direitos de propriedade intelectual, segredos comerciais ou que sejam ilícitos."
    },
    {
      "kind": "p",
      "text": "4.3. O Usuário se compromete a não: a) Utilizar o Aplicativo para fins ilegais, fraudulentos ou não autorizados; b) Compartilhar, distribuir, replicar ou comercializar o Aplicativo ou seu conteúdo sem a devida autorização expressa da Empresa; c) Violar ou tentar violar a segurança do Aplicativo, incluindo, mas não se limitando a, acesso não autorizado a sistemas, dados ou contas; d) Modificar, adaptar, traduzir, fazer engenharia reversa, descompilar, desmontar ou tentar extrair o código-fonte do Aplicativo; e) Inserir vírus, cavalos de Tróia, worms ou qualquer outro código malicioso que possa danificar, interferir, interceptar ou expropriar qualquer sistema, dado ou informação."
    },
    {
      "kind": "p",
      "text": "4.4. O Usuário reconhece que o INOVA é uma ferramenta de suporte e que a verificação da precisão das informações (como alertas de IA, cálculos de ROI, dados de desempenho) e a interpretação das informações geradas são de sua exclusiva responsabilidade profissional. A Empresa não garante a infalibilidade das análises automáticas ou da IA, as quais devem ser sempre revisadas e validadas pelo Usuário."
    },
    {
      "kind": "h2",
      "text": "5. Propriedade Intelectual"
    },
    {
      "kind": "p",
      "text": "5.1. Todos os direitos de propriedade intelectual relativos ao Aplicativo INOVA, incluindo, mas não se limitando a, software, código-fonte, design, logotipos, marcas, imagens e textos, são de propriedade exclusiva da Empresa."
    },
    {
      "kind": "p",
      "text": "5.2. Estes Termos concedem ao Usuário apenas uma licença limitada, não exclusiva, intransferível e revogável para acessar e utilizar o Aplicativo para fins profissionais, nos termos aqui estabelecidos e em conformidade com a licença concedida à Empresa Contratante. Nenhuma outra licença ou direito aos direitos de propriedade intelectual da Empresa é concedido implicitamente."
    },
    {
      "kind": "p",
      "text": "5.3. O conteúdo gerado e inserido pelo Usuário (dados de equipamentos, históricos, fotos, documentos) é de propriedade da Empresa Contratante, sendo de sua exclusiva responsabilidade o armazenamento, uso e gestão desses dados perante a lei e terceiros."
    },
    {
      "kind": "h2",
      "text": "6. Proteção de Dados Pessoais e Privacidade"
    },
    {
      "kind": "p",
      "text": "6.1. A Empresa está comprometida com a proteção da privacidade e dos dados pessoais de seus Usuários e das informações da Empresa Contratante, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD)."
    },
    {
      "kind": "p",
      "text": "6.2. Para informações detalhadas sobre como a Empresa coleta, usa, armazena, compartilha e protege seus dados pessoais e outras informações, por favor, consulte nossa Política de Privacidade completa, disponível em Política de Privacidade. A Política de Privacidade também detalha seus direitos como titular de dados e como exercê-los."
    },
    {
      "kind": "p",
      "text": "6.3. Ao aceitar estes Termos de Uso, o Usuário expressamente concorda com as práticas de privacidade descritas na Política de Privacidade do INOVA."
    },
    {
      "kind": "h2",
      "text": "7. Indisponibilidade e Limitação de Responsabilidade"
    },
    {
      "kind": "p",
      "text": "7.1. O INOVA é fornecido \"no estado em que se encontra\" e \"conforme disponível\". Embora a Empresa empregue os melhores esforços para manter o Aplicativo em funcionamento, seguro e livre de erros, não garante que ele estará sempre disponível, ininterrupto, livre de falhas ou totalmente seguro."
    },
    {
      "kind": "p",
      "text": "7.2. A Empresa não se responsabiliza por quaisquer perdas ou danos diretos, indiretos, incidentais, especiais, punitivos ou consequenciais, incluindo, mas não se limitando a, lucros cessantes, perda de dados ou interrupção de negócios, decorrentes do uso ou da incapacidade de usar o Aplicativo, mesmo que tenha sido avisada da possibilidade de tais danos."
    },
    {
      "kind": "p",
      "text": "7.3. Em nenhum caso a responsabilidade total da Empresa, por todos os danos, perdas e causas de ação, excederá o valor total pago pela Empresa Contratante pelo uso do Aplicativo nos últimos 12 (doze) meses anteriores à data do evento danoso."
    },
    {
      "kind": "p",
      "text": "7.4. O Usuário e a Empresa Contratante assumem total responsabilidade por quaisquer resultados obtidos a partir do uso do Aplicativo, incluindo decisões operacionais ou de investimento tomadas com base nas informações geradas, sendo sua a obrigação de verificação e validação de todo e qualquer dado e recomendação."
    },
    {
      "kind": "h2",
      "text": "8. Suporte Técnico"
    },
    {
      "kind": "p",
      "text": "8.1. O INOVA oferece suporte assistido por Inteligência Artificial dentro da própria aplicação para orientações e respostas baseadas em dados históricos."
    },
    {
      "kind": "p",
      "text": "8.2. Para suporte humano ou questões mais complexas, o Usuário pode entrar em contato através do e-mail: inova.sistemas.adm@gmail.com. A Empresa se compromete a envidar esforços para responder às solicitações em tempo razoável."
    },
    {
      "kind": "h2",
      "text": "9. Disposições Gerais e Modificações"
    },
    {
      "kind": "p",
      "text": "9.1. Modificações dos Termos: A Empresa reserva-se o direito de modificar estes Termos de Uso a qualquer momento, a seu exclusivo critério, visando aprimorar o serviço ou adaptar-se a novas exigências legais. O Usuário será notificado sobre quaisquer alterações significativas através de um pop-up no Aplicativo na próxima vez que ele for acessado ou por e-mail ao endereço cadastrado. A versão atualizada do Termo também será disponibilizada dentro do Aplicativo. A continuidade do uso do INOVA após a notificação das alterações constituirá aceitação tácita do Usuário aos novos Termos. Caso o Usuário não concorde com as modificações, ele deverá cessar o uso do Aplicativo."
    },
    {
      "kind": "p",
      "text": "9.2. Rescisão: Estes Termos permanecerão em vigor enquanto o Usuário estiver utilizando o Aplicativo e a Empresa Contratante mantiver sua licença/assinatura ativa. A Empresa poderá rescindir o acesso do Usuário ao Aplicativo, a qualquer momento e sem aviso prévio, caso o Usuário viole estes Termos ou a Política de Privacidade, ou caso a licença da Empresa Contratante seja encerrada. Em caso de rescisão ou suspensão da conta, o Usuário perderá imediatamente o acesso a todas as funcionalidades do Aplicativo e aos dados associados à sua conta."
    },
    {
      "kind": "p",
      "text": "9.3. Independência das Cláusulas: Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito."
    },
    {
      "kind": "p",
      "text": "9.4. Cessão: O Usuário não poderá ceder ou transferir quaisquer direitos ou obrigações sob estes Termos sem o consentimento prévio por escrito da Empresa. A Empresa poderá ceder seus direitos e obrigações a qualquer momento."
    },
    {
      "kind": "p",
      "text": "9.5. Comunicação: Todas as comunicações necessárias entre o Usuário e a Empresa deverão ser realizadas através dos canais de suporte indicados nestes Termos ou por e-mail, conforme aplicável."
    },
    {
      "kind": "h2",
      "text": "10. Lei Aplicável e Foro"
    },
    {
      "kind": "p",
      "text": "10.1. Estes Termos de Uso são regidos e interpretados de acordo com as leis da República Federativa do Brasil."
    },
    {
      "kind": "p",
      "text": "10.2. As partes elegem o Foro da Comarca de Curitiba, Estado do Paraná, para dirimir quaisquer dúvidas, litígios ou questões decorrentes destes Termos, renunciando a qualquer outro, por mais privilegiado que seja."
    },
    {
      "kind": "h2",
      "text": "Contato"
    },
    {
      "kind": "p",
      "text": "Para quaisquer dúvidas ou informações sobre estes Termos de Uso, entre em contato através do e-mail: inova.sistemas.adm@gmail.com"
    }
  ]
};
