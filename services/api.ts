import { Remito, User, Work } from '../types';

// --- MOCK DATABASE ---
// Using localStorage to persist data across reloads for a better demo experience.

const DB = {
  users: 'remitos_users',
  works: 'remitos_works',
  remitos: 'remitos_remitos',
};

// This password property is only for the mock API and wouldn't exist on a real User object sent to the frontend.
type MockUser = User & { password?: string };

const seedData = () => {
  const initialWorks: Work[] = [
    { id: 'work-1', name: 'Obra Central', address: 'Calle Falsa 123', assignedUsers: ['user-1', 'user-2'] },
    { id: 'work-2', name: 'Depósito Norte', address: 'Av. Siempreviva 742', assignedUsers: ['user-2'] },
  ];

  const initialUsers: MockUser[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin', assignedWorks: ['work-1', 'work-2'] },
    { id: 'user-2', name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'user', assignedWorks: ['work-1'] },
  ];
  
  const initialRemitos: Remito[] = [
      {
        id: 'remito-1',
        number: `REM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
        origin: 'Fábrica',
        destinationId: 'work-1',
        items: [{ id: 'item-1', name: 'Ladrillos', quantity: 1000, photos: [], observations: 'Pallet completo' }],
        createdById: 'user-1',
        status: 'en tránsito',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        senderSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAReSURBVHhe7dBBQQAgEBAx/0/tARdvgCQ5Vu2BGSAWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFggWCBYIFgg-z] pula/6pG2gAAAAElFTkSuQmCC', // dummy signature
      },
      {
        id: 'remito-2',
        number: `REM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-002`,
        origin: 'Depósito',
        destinationId: 'work-2',
        items: [
            { id: 'item-2', name: 'Bolsas de Cemento', quantity: 50, photos: [] },
            { id: 'item-3', name: 'Arena', quantity: 2, photos: [], observations: 'metros cúbicos' }
        ],
        createdById: 'user-2',
        status: 'pendiente',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      }
  ];

  if (!localStorage.getItem(DB.works)) {
    localStorage.setItem(DB.works, JSON.stringify(initialWorks));
  }
  if (!localStorage.getItem(DB.users)) {
    localStorage.setItem(DB.users, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(DB.remitos)) {
      localStorage.setItem(DB.remitos, JSON.stringify(initialRemitos));
  }
};

seedData();

const getFromDB = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const saveToDB = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

const simulateDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));


// --- API IMPLEMENTATION ---

export const api = {
    // --- AUTH ---
    async login(email: string, password_input: string): Promise<User> {
        await simulateDelay();
        const users = getFromDB<MockUser>(DB.users);
        const user = users.find(u => u.email === email && u.password === password_input);
        if (user) {
            const { password, ...userWithoutPass } = user;
            return userWithoutPass as User;
        }
        throw new Error('Credenciales inválidas');
    },

    // --- USERS ---
    async getUsers(): Promise<User[]> {
        await simulateDelay();
        const users = getFromDB<MockUser>(DB.users);
        return users.map(({ password, ...user }) => user as User);
    },
    async getUserById(id: string): Promise<User> {
        await simulateDelay();
        const users = await this.getUsers();
        const user = users.find(u => u.id === id);
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    },
    async createUser(userData: Partial<MockUser>): Promise<User> {
        await simulateDelay();
        const users = getFromDB<MockUser>(DB.users);
        const newUser: MockUser = {
            id: `user-${Date.now()}`,
            ...userData
        } as MockUser;
        if (!newUser.email || !newUser.name || !newUser.role || !newUser.password) {
            throw new Error('Faltan datos para crear usuario (nombre, email, rol, contraseña)');
        }
        if (users.some(u => u.email === newUser.email)) {
            throw new Error('El email ya está en uso');
        }
        users.push(newUser);
        saveToDB(DB.users, users);
        const { password, ...userWithoutPass } = newUser;
        return userWithoutPass as User;
    },
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        await simulateDelay();
        const users = getFromDB<MockUser>(DB.users);
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) throw new Error('Usuario no encontrado');
        users[userIndex] = { ...users[userIndex], ...userData };
        saveToDB(DB.users, users);
        const { password, ...userWithoutPass } = users[userIndex];
        return userWithoutPass as User;
    },
    async deleteUser(id: string): Promise<void> {
        await simulateDelay();
        let users = getFromDB<User>(DB.users);
        users = users.filter(u => u.id !== id);
        saveToDB(DB.users, users);
    },

    // --- WORKS ---
    async getWorks(): Promise<Work[]> {
        await simulateDelay();
        return getFromDB<Work>(DB.works);
    },
    async getWorkById(id: string): Promise<Work> {
        await simulateDelay();
        const works = await this.getWorks();
        const work = works.find(w => w.id === id);
        if (!work) throw new Error('Obra no encontrada');
        return work;
    },
     async createWork(workData: Partial<Work>): Promise<Work> {
        await simulateDelay();
        const works = getFromDB<Work>(DB.works);
        const newWork: Work = {
            id: `work-${Date.now()}`,
            assignedUsers: [],
            ...workData
        } as Work;
         if (!newWork.name || !newWork.address) {
            throw new Error('Faltan datos para crear la obra');
        }
        works.push(newWork);
        saveToDB(DB.works, works);
        return newWork;
    },
    async updateWork(id: string, workData: Partial<Work>): Promise<Work> {
        await simulateDelay();
        const works = getFromDB<Work>(DB.works);
        const workIndex = works.findIndex(w => w.id === id);
        if (workIndex === -1) throw new Error('Obra no encontrada');
        works[workIndex] = { ...works[workIndex], ...workData };
        saveToDB(DB.works, works);
        return works[workIndex];
    },
    async deleteWork(id: string): Promise<void> {
        await simulateDelay();
        let works = getFromDB<Work>(DB.works);
        works = works.filter(w => w.id !== id);
        saveToDB(DB.works, works);
    },

    // --- REMITOS ---
    async getRemitos(filters: any): Promise<Remito[]> {
        await simulateDelay();
        let remitos = getFromDB<Remito>(DB.remitos);
        
        if (filters.workId) {
            remitos = remitos.filter(r => r.destinationId === filters.workId);
        }
        if (filters.userId) {
            remitos = remitos.filter(r => r.createdById === filters.userId);
        }
        if (filters.status) {
            remitos = remitos.filter(r => r.status === filters.status);
        }
        if (filters.item) {
            remitos = remitos.filter(r => r.items.some(i => i.name.toLowerCase().includes(filters.item.toLowerCase())));
        }
        if (filters.startDate) {
            remitos = remitos.filter(r => new Date(r.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            remitos = remitos.filter(r => new Date(r.createdAt) <= new Date(filters.endDate + 'T23:59:59'));
        }

        return remitos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async getRemitoById(id: string): Promise<Remito> {
        await simulateDelay();
        const remitos = getFromDB<Remito>(DB.remitos);
        const remito = remitos.find(r => r.id === id);
        if (!remito) throw new Error('Remito no encontrado');
        return remito;
    },
    async createRemito(remitoData: Partial<Remito>): Promise<Remito> {
        await simulateDelay();
        const remitos = getFromDB<Remito>(DB.remitos);
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const todayRemitos = remitos.filter(r => r.number.startsWith(`REM-${dateStr}`)).length;
        const sequence = (todayRemitos + 1).toString().padStart(3, '0');

        const newRemito: Remito = {
            id: `remito-${Date.now()}`,
            number: `REM-${dateStr}-${sequence}`,
            createdAt: today.toISOString(),
            ...remitoData,
        } as Remito;

        if (!newRemito.destinationId || !newRemito.origin || !newRemito.items || newRemito.items.length === 0) {
             throw new Error('Faltan datos para crear el remito');
        }

        remitos.push(newRemito);
        saveToDB(DB.remitos, remitos);
        return newRemito;
    },
    async updateRemito(id: string, remitoData: Partial<Remito>): Promise<Remito> {
        await simulateDelay();
        const remitos = getFromDB<Remito>(DB.remitos);
        const remitoIndex = remitos.findIndex(r => r.id === id);
        if (remitoIndex === -1) throw new Error('Remito no encontrado');
        remitos[remitoIndex] = { ...remitos[remitoIndex], ...remitoData };
        saveToDB(DB.remitos, remitos);
        return remitos[remitoIndex];
    },
    async deleteRemito(id: string): Promise<void> {
        await simulateDelay();
        let remitos = getFromDB<Remito>(DB.remitos);
        remitos = remitos.filter(r => r.id !== id);
        saveToDB(DB.remitos, remitos);
    },
};
