import tkinter as tk
import re

def validar_senha(senha):
    erros = []
    if len(senha) < 8:
        erros.append("A senha deve ter pelo menos 8 caracteres.")
    if not re.search(r"[A-Z]", senha):
        erros.append("A senha deve conter letras maiúsculas.")
    if not re.search(r"[a-z]", senha):
        erros.append("A senha deve conter letras minúsculas.")
    if not re.search(r"[0-9]", senha):
        erros.append("A senha deve conter números.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", senha):
        erros.append("A senha deve conter caracteres especiais.")
    return erros

def checar():
    senha = entrada.get()
    resultado.delete(1.0, tk.END)
    erros = validar_senha(senha)
    if erros:
        resultado.insert(tk.END, "\n".join(erros))
        resultado.config(fg="red")
    else:
        resultado.insert(tk.END, "Senha forte! ✅")
        resultado.config(fg="green")

# Interface Gráfica
janela = tk.Tk()
janela.title("Validador de Senhas")

tk.Label(janela, text="Digite sua senha:").pack(pady=5)
entrada = tk.Entry(janela, show="*", width=30)
entrada.pack(pady=5)

tk.Button(janela, text="Validar", command=checar).pack(pady=5)
resultado = tk.Text(janela, height=5, width=40)
resultado.pack(pady=5)

janela.mainloop()