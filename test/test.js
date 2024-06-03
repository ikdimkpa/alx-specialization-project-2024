import connectDB from './server/config/db.js'

test('Connection to database', () => {
	expect(connectDB()).toBe(`Database connected: ${conn.connection.host}`);
});
