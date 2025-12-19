export default function DynamicLavaBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-warm-bg-light dark:bg-warm-bg-dark">
      <div
        className="absolute bg-warm-primary/30 rounded-full filter blur-3xl animate-blob-1"
        style={{
          width: "clamp(200px, 30vw, 400px)",
          height: "clamp(200px, 30vw, 400px)",
          top: "7vh",
          left: "15vw",
        }}
      />
      <div
        className="absolute bg-warm-secondary/30 rounded-full filter blur-3xl animate-blob-2"
        style={{
          width: "clamp(150px, 25vw, 350px)",
          height: "clamp(150px, 25vw, 350px)",
          top: "5vh",
          left: "17vw",
          animationDelay: "-5s", // Negative delay starts animation partway through
        }}
      />
      <div
        className="absolute bg-warm-accent/20 rounded-full filter blur-3xl animate-blob-3"
        style={{
          width: "clamp(100px, 20vw, 300px)",
          height: "clamp(100px, 20vw, 300px)",
          top: "6vh",
          left: "12vw",
          animationDelay: "-4s",
        }}
      />
      <div
        className="absolute bg-warm-primary/20 rounded-full filter blur-3xl animate-blob-4"
        style={{
          width: "clamp(250px, 35vw, 450px)",
          height: "clamp(250px, 35vw, 450px)",
          top: "15vh",
          left: "2vw",
          animationDelay: "-5s",
        }}
      />
    </div>
  )
}
