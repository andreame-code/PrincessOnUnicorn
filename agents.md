# agents.md

## Obiettivo
Apportare modifiche piccole, mirate e sicure, evitando cambiamenti non collegati alla richiesta.

## Regole operative
1. **Una cosa alla volta**: ogni intervento deve risolvere un singolo problema o una singola richiesta.
2. **Scope minimo**: tocca solo i file direttamente coinvolti dal task.
3. **No refactor gratuiti**: non rinominare, spostare o riformattare codice se non è necessario per la modifica richiesta.
4. **Diff pulito**: evita modifiche collaterali (whitespace, import reorder, log, commenti non richiesti).
5. **Verifica mirata**: esegui solo test/check legati ai file toccati.
6. **Messaggio chiaro**: descrivi cosa è stato cambiato e perché, in modo breve.

## Checklist prima del commit
- [ ] Ho modificato solo file pertinenti.
- [ ] Le modifiche sono piccole e reversibili.
- [ ] Non ho introdotto cambiamenti estetici non richiesti.
- [ ] Ho eseguito almeno un controllo/test rilevante.
