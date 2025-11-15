import json
import os
from datetime import datetime

class Tarefa:
    def __init__(self, titulo, descricao, prioridade="Média"):
        self.titulo = titulo
        self.descricao = descricao
        self.prioridade = prioridade
        self.concluida = False
        self.criada_em = datetime.now().isoformat()

    def concluir(self):
        self.concluida = True

    def to_dict(self):
        return {
            "titulo": self.titulo,
            "descricao": self.descricao,
            "prioridade": self.prioridade,
            "concluida": self.concluida,
            "criada_em": self.criada_em
        }

    @staticmethod
    def from_dict(data):
        tarefa = Tarefa(data["titulo"], data["descricao"], data["prioridade"])
        tarefa.concluida = data["concluida"]
        tarefa.criada_em = data["criada_em"]
        return tarefa

class GerenciadorDeTarefas:
    def __init__(self, arquivo="tarefas.json"):
        self.arquivo = arquivo
        self.tarefas = self.carregar()

    def carregar(self):
        if not os.path.exists(self.arquivo):
            return []
        with open(self.arquivo, "r") as f:
            dados = json.load(f)
            return [Tarefa.from_dict(t) for t in dados]

    def salvar(self):
        with open(self.arquivo, "w") as f:
            json.dump([t.to_dict() for t in self.tarefas], f, indent=4)

    def adicionar(self, tarefa):
        self.tarefas.append(tarefa)
        self.salvar()

    def listar(self):
        for i, t in enumerate(self.tarefas):
            status = "✔️" if t.concluida else "❌"
            print(f"{i+1}. [{status}] {t.titulo} ({t.prioridade}) - Criada em {t.criada_em}")

    def concluir(self, indice):
        if 0 <= indice < len(self.tarefas):
            self.tarefas[indice].concluir()
            self.salvar()

    def remover(self, indice):
        if 0 <= indice < len(self.tarefas):
            del self.tarefas[indice]
            self.salvar()

def menu():
    gestor = GerenciadorDeTarefas()
    while True:
        print("\n📋 MENU DE TAREFAS")
        print("1. Adicionar tarefa")
        print("2. Listar tarefas")
        print("3. Concluir tarefa")
        print("4. Remover tarefa")
        print("5. Sair")
        escolha = input("Escolha uma opção: ")

        if escolha == "1":
            titulo = input("Título: ")
            descricao = input("Descrição: ")
            prioridade = input("Prioridade (Alta/Média/Baixa): ")
            tarefa = Tarefa(titulo, descricao, prioridade)
            gestor.adicionar(tarefa)
            print("✅ Tarefa adicionada!")
        elif escolha == "2":
            gestor.listar()
        elif escolha == "3":
            gestor.listar()
            indice = int(input("Número da tarefa a concluir: ")) - 1
            gestor.concluir(indice)
            print("✅ Tarefa concluída!")
        elif escolha == "4":
            gestor.listar()
            indice = int(input("Número da tarefa a remover: ")) - 1
            gestor.remover(indice)
            print("🗑️ Tarefa removida!")
        elif escolha == "5":
            print("👋 Saindo...")
            break
        else:
            print("❌ Opção inválida!")

if __name__ == "__main__":
    menu()