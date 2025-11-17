# Cobrinha — Projeto para Disciplina de Lógica de Computação (2025)

> https://snake-game-logica-computacao.vercel.app/

Projeto desenvolvido como trabalho do 2º período do curso de Ciência da Computação — UNIFUCAMP (2025).

**Professor:** Luiz Gustavo

**Autores:** Bruno Tetsuo, Pedro Augusto e Eli Junior

Descrição
---------
Este repositório contém uma versão didática do clássico jogo "Cobrinha" (Snake), adaptada para exercícios de lógica de computação. O jogo apresenta perguntas de lógica proposicional integradas à mecânica: a cobrinha deve alcançar a opção correta para ganhar pontos.

Arquivos importantes
-------------------
- `index.html` — página principal que carrega o jogo.
- `styles.css` — estilos do layout e adaptação responsiva.
- `script.js` — lógica do jogo (movimento, perguntas, pontuação e persistência no `localStorage`).
- `music.mp3`, `correct.wav`, `failure.wav` — assets de áudio (opcionais).

Como jogar
----------
No computador (desktop/laptop):

- Preencha o campo com seu nome e clique em **Iniciar Jogo**.
- Controle a cobrinha usando as teclas de seta (`↑ ↓ ← →`) ou `W A S D`.
- No tabuleiro aparecerão duas opções para cada pergunta; leve a cobrinha até a opção correta para marcar ponto.
- Ao errar uma opção a cobrinha perde tamanho (ou o jogo termina, dependendo do estado); o jogo termina também se a cobrinha colidir com seu corpo.
- O placar é salvo no `localStorage` do navegador e exibido na tela inicial.

No celular (touch):

- Toque e arraste (swipe) no canvas para controlar a direção da cobrinha — deslize na direção desejada (esquerda/direita/cima/baixo).
- Toque em **Iniciar Jogo** para começar (é necessário um gesto do usuário para liberar reprodução de áudio em alguns dispositivos).

Dicas
-----
- Use movimentos suaves e antecipe a posição das opções; o jogo usa uma grade fixa (20x20) para o movimento.
- Se o áudio não tocar ao iniciar, verifique as permissões do navegador (alguns exigem primeiro toque do usuário para liberar som).

--------------------------------
O jogo já está publicado e disponível publicamente em produção. Para jogar, abra a versão hospedada:

https://snake-game-logica-computacao.vercel.app/

