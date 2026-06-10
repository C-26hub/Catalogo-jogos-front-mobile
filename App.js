import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from "react-native";

import api from "./src/services/api";
import theme from "./src/styles/theme";

export default function App() {
  const [games, setGames] = useState([]);

  const [nome, setNome] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [genero, setGenero] = useState("");
  const [status, setStatus] = useState("Quero Jogar");
  const [nota, setNota] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [fontsLoaded] = useFonts({
    Pixel: require("./assets/fonts/PressStart2P-Regular.ttf"),
  });

  async function loadGames() {
    try {
      const response = await api.get("/games");
      setGames(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  async function saveGame() {
    if (!nome || !plataforma || !genero || nota === "") {
      Alert.alert(
        "Erro",
        "Preencha todos os campos."
      );
      return;
    }

    const notaNumero = Number(nota);

    if (notaNumero < 0 || notaNumero > 10) {
      Alert.alert(
        "Erro",
        "A nota deve ser entre 0 e 10."
      );
      return;
    }

    try {
      if (editingId) {
        await api.put(`/games/${editingId}`, {
          nome,
          plataforma,
          genero,
          status,
          nota: notaNumero
        });

        Alert.alert(
          "Sucesso",
          "Jogo atualizado!"
        );
      } else {
        await api.post("/games", {
          nome,
          plataforma,
          genero,
          status,
          nota: notaNumero
        });

        Alert.alert(
          "Sucesso",
          "Jogo cadastrado!"
        );
      }

      clearForm();
      loadGames();

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível salvar."
      );
    }
  }

  function editGame(game) {
    setEditingId(game._id);

    setNome(game.nome);
    setPlataforma(game.plataforma);
    setGenero(game.genero);
    setStatus(game.status);
    setNota(String(game.nota));
  }

  async function deleteGame(id) {
    Alert.alert(
      "Excluir",
      "Deseja excluir este jogo?",
      [
        {
          text: "Cancelar"
        },
        {
          text: "Excluir",
          onPress: async () => {
            await api.delete(`/games/${id}`);
            loadGames();
          }
        }
      ]
    );
  }

  function clearForm() {
    setNome("");
    setPlataforma("");
    setGenero("");
    setStatus("Quero Jogar");
    setNota("");

    setEditingId(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          🎮 Meus Jogos 🎮
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do jogo"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Plataforma"
          placeholderTextColor="#888"
          value={plataforma}
          onChangeText={setPlataforma}
        />

        <TextInput
          style={styles.input}
          placeholder="Gênero"
          placeholderTextColor="#888"
          value={genero}
          onChangeText={setGenero}
        />

        <Text style={styles.statusTitle}>
          STATUS
        </Text>

        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === "Quero Jogar" &&
                styles.selectedStatus
            ]}
            onPress={() =>
              setStatus("Quero Jogar")
            }
          >
            <Text style={styles.statusText}>
              Quero Jogar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              status === "Jogando" &&
                styles.selectedStatus
            ]}
            onPress={() =>
              setStatus("Jogando")
            }
          >
            <Text style={styles.statusText}>
              Jogando
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              status === "Finalizado" &&
                styles.selectedStatus
            ]}
            onPress={() =>
              setStatus("Finalizado")
            }
          >
            <Text style={styles.statusText}>
              Finalizado
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nota (0 a 10)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={nota}
          onChangeText={setNota}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={saveGame}
        >
          <Text style={styles.buttonText}>
            {editingId
              ? "ATUALIZAR JOGO"
              : "CADASTRAR JOGO"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.gameName}>
              {item.nome}
            </Text>

            <Text style={styles.cardText}>
              🎮 {item.plataforma}
            </Text>

            <Text style={styles.cardText}>
              🕹️ {item.genero}
            </Text>

            <Text style={styles.cardText}>
              📌 {item.status}
            </Text>

            <Text style={styles.cardText}>
              ⭐ Nota: {item.nota}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editGame(item)}
              >
                <Text style={styles.actionText}>
                  EDITAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  deleteGame(item._id)
                }
              >
                <Text style={styles.actionText}>
                  EXCLUIR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20
  },

  formContainer: {
    marginTop: 40,
    marginBottom: 20
  },

  title: {
    color: "#C77DFF",
    fontSize: 22,
    fontFamily: "Pixel",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 28
  },

  input: {
    backgroundColor: theme.colors.card,
    color: "#FFF",
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },

  statusTitle: {
    color: "#FFF",
    marginBottom: 8,
    fontWeight: "bold"
  },

  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15
  },

  statusButton: {
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#9D4EDD",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    marginBottom: 8
  },

  selectedStatus: {
    backgroundColor: "#9D4EDD"
  },

  statusText: {
    color: "#FFF"
  },

  button: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12
  },

  gameName: {
    color: "#C77DFF",
    fontSize: 14,
    fontFamily: "Pixel",
    marginBottom: 12,
    lineHeight: 24
  },

  cardText: {
    color: "#FFF",
    marginBottom: 4
  },

  actions: {
    flexDirection: "row",
    marginTop: 12
  },

  editButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 8,
    marginRight: 5
  },

  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    padding: 10,
    borderRadius: 8
  },

  actionText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold"
  }
});