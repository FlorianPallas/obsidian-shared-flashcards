import { Vault } from 'obsidian';

export const getRootPath = () => '.collaborate';

export const existsRoot = async (vault: Vault) =>
  await vault.adapter.exists(getRootPath());

export const createRoot = async (vault: Vault) => {
  if (await vault.adapter.exists(getRootPath())) return;
  await vault.adapter.mkdir(getRootPath());
  await vault.adapter.write(`${getRootPath()}/.gitignore`, 'user');
};

export const getUserPath = (user: string) => `${getRootPath()}/${user}`;

export const existsUserRoot = async (vault: Vault, user: string) =>
  await vault.adapter.exists(getUserPath(user));

export const createUserRoot = async (vault: Vault, user: string) => {
  await createRoot(vault);
  const userRoot = getUserPath(user);
  if (await vault.adapter.exists(userRoot)) return;
  await vault.adapter.mkdir(userRoot);
  await vault.adapter.write(`${userRoot}/.gitkeep`, '');
};

const collaborateUser = `${getRootPath()}/user`;

export const hasUser = async (vault: Vault) => {
  return await vault.adapter.exists(collaborateUser);
};

export const createUser = async (vault: Vault, user: string): Promise<void> => {
  if (await hasUser(vault)) throw new Error('User already exists');

  // create collaborate root
  await vault.adapter.mkdir(getRootPath());
  await writeUser(vault, user);
  await vault.adapter.write(`${getRootPath()}/.gitignore`, 'user');

  // create user root
  const userRoot = getUserPath(user);
};

export const deleteUser = async (vault: Vault): Promise<void> => {
  if (!(await hasUser(vault))) return;
  vault.adapter.remove(collaborateUser);
};

export const readUser = async (vault: Vault): Promise<string | undefined> => {
  if (!(await hasUser(vault))) return;
  return vault.adapter.read(collaborateUser);
};

export const writeUser = async (vault: Vault, user: string): Promise<void> => {
  vault.adapter.write(collaborateUser, user);
};
