// Simple state management
class Store {
  constructor() {
    this.state = {
      user: null,
      patients: [],
      sessions: [],
      groups: [],
      events: [],
      expenses: [],
      receivables: [],
      invoices: [],
      settings: {},
      loading: false
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Specific getters
  getPatients() {
    return this.state.patients;
  }

  getSessions() {
    return this.state.sessions;
  }

  // Specific setters
  setPatients(patients) {
    this.setState({ patients });
  }

  setSessions(sessions) {
    this.setState({ sessions });
  }

  setUser(user) {
    this.setState({ user });
  }

  setSettings(settings) {
    this.setState({ settings });
  }
}

export const store = new Store();



