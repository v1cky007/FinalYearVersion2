import random

class QuantumBB84:
    """
    Simulates the BB84 Quantum Key Distribution (QKD) protocol.
    Generates a secure 'One-Time Session Key'.
    """
    def __init__(self, length=256):
        self.length = length
        self.alice_bits = []
        self.alice_bases = []
        self.bob_bases = []
        self.bob_results = []
        self.final_key = []

    def step_1_alice_prepare(self):
        """Alice generates random bits and bases."""
        self.alice_bits = [random.choice([0, 1]) for _ in range(self.length)]
        self.alice_bases = [random.choice(['+', 'x']) for _ in range(self.length)]

    def step_2_bob_measure(self):
        """Bob measures using random bases."""
        self.bob_bases = [random.choice(['+', 'x']) for _ in range(self.length)]
        self.bob_results = []
        for i in range(self.length):
            if self.alice_bases[i] == self.bob_bases[i]:
                self.bob_results.append(self.alice_bits[i])
            else:
                self.bob_results.append(random.choice([0, 1]))

    def step_3_sifting(self):
        """Sifting: Keep bits where bases matched."""
        sifted = [self.alice_bits[i] for i in range(self.length) if self.alice_bases[i] == self.bob_bases[i]]
        self.final_key = sifted
        return "".join(map(str, sifted))

def generate_quantum_key(length=512):
    qkd = QuantumBB84(length)
    qkd.step_1_alice_prepare()
    qkd.step_2_bob_measure()
    return qkd.step_3_sifting()