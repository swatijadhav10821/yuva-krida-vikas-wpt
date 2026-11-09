function About() {
  return (
    <div className="max-w-4xl mx-auto my-10 px-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">About Yuva Krida Vikas</h1>
      <p className="text-gray-700 mb-6">
        Yuva Krida Vikas is a platform for young sportspersons in Maharashtra. It helps athletes find
        training, book sports facilities and register for tournaments, all in one place.
      </p>

      <h2 className="text-xl font-semibold mb-2">What we do</h2>
      <ul className="list-disc ml-6 text-gray-700 mb-6">
        <li>Athletes can register, book a facility and enrol in coaching programs.</li>
        <li>Coaches can manage training sessions, mark attendance and enter match scores.</li>
        <li>Admins can manage users, facilities, tournaments and visitor messages.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Our mission</h2>
      <p className="text-gray-700 mb-6">
        To give every young athlete an equal chance to train well, play often and be noticed.
      </p>

      <h2 className="text-xl font-semibold mb-2">Who can use it</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Athletes</h3>
          <p className="text-gray-700">Book facilities, join training and register for tournaments.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Coaches</h3>
          <p className="text-gray-700">Run training programs, take attendance and record scores.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Admins</h3>
          <p className="text-gray-700">Keep the platform organised and answer visitor questions.</p>
        </div>
      </div>
    </div>
  );
}

export default About;