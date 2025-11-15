import tkinter as tk
from tkinter import messagebox

class JogoDaVelha:
    def __init__(self, root):
        self.root = root
        self.root.title("Jogo da Velha")
        self.jogador = "X"
        self.botoes = [[None for _ in range(3)] for _ in range(3)]
        self.criar_interface()

    def criar_interface(self):
        for i in range(3):
            for j in range(3):
                botao = tk.Button(self.root, text="", font=("Arial", 24), width=5, height=2,
                                  command=lambda i=i, j=j: self.clique(i, j))
                botao.grid(row=i, column=j)
                self.botoes[i][j] = botao

    def clique(self, i, j):
        botao = self.botoes[i][j]
        if botao["text"] == "":
            botao["text"] = self.jogador
            if self.verificar_vitoria():
                messagebox.showinfo("Fim de jogo", f"Jogador {self.jogador} venceu!")
                self.reiniciar()
            elif self.empate():
                messagebox.showinfo("Fim de jogo", "Empate!")
                self.reiniciar()
            else:
                self.jogador = "O" if self.jogador == "X" else "X"

    def verificar_vitoria(self):
        for i in range(3):
            if self.botoes[i][0]["text"] == self.botoes[i][1]["text"] == self.botoes[i][2]["text"] != "":
                return True
            if self.botoes[0][i]["text"] == self.botoes[1][i]["text"] == self.botoes[2][i]["text"] != "":
                return True
        if self.botoes[0][0]["text"] == self.botoes[1][1]["text"] == self.botoes[2][2]["text"] != "":
            return True
        if self.botoes[0][2]["text"] == self.botoes[1][1]["text"] == self.botoes[2][0]["text"] != "":
            return True
        return False

    def empate(self):
        for linha in self.botoes:
            for botao in linha:
                if botao["text"] == "":
                    return False
        return True

    def reiniciar(self):
        for linha in self.botoes:
            for botao in linha:
                botao["text"] = ""
        self.jogador = "X"

if __name__ == "__main__":
    root = tk.Tk()
    jogo = JogoDaVelha(root)
    root.mainloop()