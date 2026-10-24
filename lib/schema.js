const DEFAULT_PRICES = [
  {
    id: "2-step",
    name: "2 Step",
    balances: [
      { size: 5000, price: 59, leverage: "1:100" },
      { size: 10000, price: 99, leverage: "1:100" },
      { size: 25000, price: 199, leverage: "1:100" },
      { size: 50000, price: 299, leverage: "1:100" },
      { size: 100000, price: 555, leverage: "1:100" },
      { size: 200000, price: 999, leverage: "1:100" },
    ],
  },
  {
    id: "flex",
    name: "Flex",
    balances: [
      { size: 5000, price: 49, leverage: "1:100" },
      { size: 10000, price: 89, leverage: "1:100" },
      { size: 25000, price: 169, leverage: "1:100" },
      { size: 50000, price: 269, leverage: "1:100" },
      { size: 100000, price: 469, leverage: "1:100" },
      { size: 200000, price: 869, leverage: "1:100" },
    ],
  },
  {
    id: "zero",
    name: "Zero",
    balances: [
      { size: 5000, price: 79, leverage: "1:100" },
      { size: 10000, price: 129, leverage: "1:100" },
      { size: 25000, price: 249, leverage: "1:100" },
      { size: 50000, price: 379, leverage: "1:100" },
      { size: 100000, price: 649, leverage: "1:100" },
      { size: 200000, price: 1199, leverage: "1:100" },
    ],
  },
];

let ready = false;

async function ensureSchema(sql) {
  if (ready) return;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      token text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS challenges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      evaluation_type text NOT NULL,
      account_size numeric NOT NULL,
      platform text NOT NULL DEFAULT 'MetaTrader 5',
      addons jsonb NOT NULL DEFAULT '[]'::jsonb,
      fee numeric NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS challenge_prices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_key text NOT NULL,
      challenge_name text NOT NULL,
      account_size numeric NOT NULL,
      price numeric NOT NULL,
      leverage text NOT NULL DEFAULT '1:100',
      UNIQUE (challenge_key, account_size)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payouts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount numeric NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dashboards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id uuid REFERENCES challenges(id) ON DELETE SET NULL,
      account_number text NOT NULL,
      username text NOT NULL,
      server text NOT NULL,
      currency text NOT NULL DEFAULT 'USD',
      platform text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      visitor_key text NOT NULL,
      visitor_name text NOT NULL DEFAULT '',
      visitor_email text NOT NULL DEFAULT '',
      subject text NOT NULL,
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author text NOT NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const count = await sql`SELECT count(*)::int AS count FROM challenge_prices`;
  if (Number(count[0]?.count || 0) === 0) {
    for (const item of DEFAULT_PRICES) {
      for (const balance of item.balances) {
        await sql`
          INSERT INTO challenge_prices (challenge_key, challenge_name, account_size, price, leverage)
          VALUES (${item.id}, ${item.name}, ${balance.size}, ${balance.price}, ${balance.leverage})
          ON CONFLICT (challenge_key, account_size) DO NOTHING
        `;
      }
    }
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  if (adminEmail) {
    await sql`UPDATE users SET role = 'admin' WHERE lower(email) = ${adminEmail}`;
  }

  ready = true;
}

async function catalogFee(sql, evaluationType, accountSize) {
  await ensureSchema(sql);
  const rows = await sql`
    SELECT price
    FROM challenge_prices
    WHERE lower(challenge_name) = ${String(evaluationType).toLowerCase()}
      AND account_size = ${accountSize}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const price = Number(rows[0].price);
  return Number.isFinite(price) ? price : null;
}

module.exports = { ensureSchema, catalogFee, DEFAULT_PRICES };
