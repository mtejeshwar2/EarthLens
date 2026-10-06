from __future__ import annotations

from sklearn.ensemble import ExtraTreesRegressor, HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.cross_decomposition import PLSRegression
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.svm import SVR

from app.ml.preprocessing import make_preprocessor


def candidate_models(seed: int = 42, trees: int = 250, n_components: int = 8) -> dict[str, Pipeline]:
    return {
        "ridge": Pipeline([("prep", make_preprocessor(True)), ("regressor", Ridge(alpha=10.0))]),
        "pls": Pipeline([("prep", make_preprocessor(True)), ("regressor", PLSRegression(n_components=max(1, n_components), scale=False, max_iter=500))]),
        "svr_rbf": Pipeline([("prep", make_preprocessor(True)), ("regressor", MultiOutputRegressor(SVR(C=10.0, epsilon=0.1, kernel="rbf"), n_jobs=-1))]),
        "random_forest": Pipeline([("prep", make_preprocessor(False)), ("regressor", RandomForestRegressor(n_estimators=trees, min_samples_leaf=2, max_features=0.8, random_state=seed, n_jobs=-1))]),
        "extra_trees": Pipeline([("prep", make_preprocessor(False)), ("regressor", ExtraTreesRegressor(n_estimators=trees, min_samples_leaf=2, max_features=0.8, random_state=seed, n_jobs=-1))]),
        "hist_gradient_boosting": Pipeline([("prep", make_preprocessor(False)), ("regressor", MultiOutputRegressor(HistGradientBoostingRegressor(max_iter=180, l2_regularization=1.0, random_state=seed), n_jobs=-1))]),
    }
