# Installation Guide

## Prerequisites

Before installing this application, ensure you have the following dependencies installed on your system:

- **Git** (to clone the repository)
- **Node.js** (latest LTS recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (for database management)

### Install Dependencies Based on Your Linux Distribution

#### **Gentoo Linux**

```sh
sudo emerge --ask dev-vcs/git dev-lang/nodejs dev-db/postgresql
```

#### **Arch Linux**

```sh
sudo pacman -S git nodejs npm postgresql
```

#### **Debian / Ubuntu**

```sh
sudo apt update && sudo apt install -y git nodejs npm postgresql postgresql-contrib
```

---

## Step 1: Clone the Repository

```sh
git clone https://github.com/yourusername/yourrepository.git
cd yourrepository
```

Replace `yourusername/yourrepository` with your actual GitHub repository URL.

---

## Step 2: Set Up PostgreSQL

### Initialize and Start PostgreSQL

#### **Gentoo Linux**

```sh
sudo emerge --config postgresql
sudo rc-service postgresql start
sudo rc-update add postgresql default
```

#### **Arch Linux (First-Time Setup)**

```sh
sudo systemctl enable --now postgresql
sudo -iu postgres initdb --locale en_US.UTF-8 -D /var/lib/postgres/data
sudo systemctl restart postgresql
```

#### **Debian / Ubuntu**

```sh
sudo systemctl enable --now postgresql
```

### Create the Database and User

```sh
sudo -iu postgres psql
```

Then, inside the PostgreSQL prompt:

```sql
CREATE DATABASE school_devices;
CREATE USER school_admin WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE school_devices TO school_admin;
\q
```

Replace `'yourpassword'` with a secure password.

### Run the Database Schema

```sh
psql -U school_admin -d school_devices -f server/create_db.sql
```

If needed, specify the password when prompted.

---

## Step 3: Install Node.js Dependencies

Navigate to the `server/` directory:

```sh
cd server
npm install
```

---

## Step 4: Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```sh
touch .env
nano .env
```

Add the following content:

```env
DB_USER=school_admin
DB_HOST=localhost
DB_NAME=school_devices
DB_PASSWORD=yourpassword
DB_PORT=5432
PORT=5000
```

Replace `yourpassword` with the actual password you set for the database user.

---

## Step 5: Start the Application

Start the Node.js server:

```sh
node server/index.js
```

If using **PM2** for production:

```sh
npm install -g pm2
pm start
```

---

## Step 6: Test the API

You can test if the server is running by opening a new terminal and running:

```sh
curl http://localhost:5000/api/pupils
```

If everything is set up correctly, you should receive a JSON response.

---

## Step 7: (Optional) Enable Firewall Access

If you're accessing this server remotely, allow traffic on port 5000:

```sh
sudo ufw allow 5000/tcp
```

---

## Step 8: Setting Up Frontend (If Required)

If there’s a frontend application in `public/`, serve it using:

```sh
cd public
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a web browser.

---

## Troubleshooting

### PostgreSQL Issues

- If you cannot connect to PostgreSQL, ensure it's running:
  ```sh
  sudo systemctl status postgresql
  ```
- Check PostgreSQL logs for errors:
  ```sh
  sudo journalctl -u postgresql --no-pager
  ```
- If password authentication fails, edit `pg_hba.conf` (PostgreSQL authentication config) and restart the service.

### Node.js Issues

- Ensure dependencies are installed:
  ```sh
  npm install
  ```
- If the server crashes, check logs for errors:
  ```sh
  node server/index.js
  ```
- If port 5000 is in use, change it in `.env` and restart the server.

---

## Conclusion

Your application should now be fully set up and running on your Linux system. 🚀 If you encounter any issues, check the logs or refer to the troubleshooting section. Happy coding!


