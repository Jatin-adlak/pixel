export default function Features() {

  const features = [
    {
      title: "Event Galleries",
      desc: "Create events and collect photos from everyone."
    },
    {
      title: "Instant Upload",
      desc: "Participants upload media instantly."
    },
    {
      title: "Smart Organization",
      desc: "Automatically organized by event."
    }
  ]

  return (

    <section className="py-32 bg-gray-50">

      <h2 className="text-4xl font-bold text-center mb-16">
        Features
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-10">

        {features.map((feature, i) => (

          <div
            key={i}
            className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition"
          >

            <h3 className="text-xl font-semibold mb-4">
              {feature.title}
            </h3>

            <p className="text-gray-500">
              {feature.desc}
            </p>

          </div>

        ))}

      </div>

    </section>

  )
}