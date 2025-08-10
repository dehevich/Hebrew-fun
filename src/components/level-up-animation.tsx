// Add this interface at the top
interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Then update the state declaration
const [fireworks, setFireworks] = useState<Firework[]>([]);