import express, {Request, Response, NextFunction} from 'express';

const app = express();

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

app.listen(3000, () => console.log('Server is running on port 3000'));