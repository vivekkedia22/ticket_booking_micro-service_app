export const natsWrapper = {
  client: {
    
    jetstream: jest.fn().mockReturnValue({
      
      publish: jest.fn().mockResolvedValue(undefined),
      
    }),
  },
};
